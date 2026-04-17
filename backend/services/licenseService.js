const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const LicenseTemplate = require('../models/LicenseTemplate');
const IssuedLicense = require('../models/IssuedLicense');

const MARGIN = 65;
const PAGE_BOTTOM_THRESHOLD = 120;

class LicenseService {

    async generateLicenseNumber() {
        const year = new Date().getFullYear();
        const prefix = `OTP-${year}-`;
        const startOfYear = new Date(year, 0, 1);
        const count = await IssuedLicense.countDocuments({ issuedAt: { $gte: startOfYear } });
        return `${prefix}${String(count + 1).padStart(6, '0')}`;
    }

    generateDocumentHash(licenseData) {
        const data = JSON.stringify({
            licenseId: licenseData.licenseId,
            licenseNumber: licenseData.licenseNumber,
            beatTitle: licenseData.beatTitle,
            buyerEmail: licenseData.buyerEmail,
            issuedAt: licenseData.issuedAt
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    async getLicenseTemplate(tier) {
        let template = await LicenseTemplate.findOne({ tier, active: true }).sort({ version: -1 });
        if (!template) {
            template = await this.createDefaultTemplate(tier);
        }
        return template;
    }

    async createDefaultTemplate(tier) {
        const templates = {
            'Basic': {
                templateId: `basic-${Date.now()}`,
                tier: 'Basic',
                displayName: 'Basic License',
                version: '2026-04-17',
                body: 'Basic non-exclusive license for non-commercial use.',
                limits: {
                    distributionLimit: 1000,
                    audioStreams: 50000,
                    musicVideos: 1,
                    forProfitPerformances: false,
                    radioBroadcasting: 0,
                    contentIdAllowed: false
                },
                publishingSplit: { producerTotalShare: 50, licenseeShare: 50 },
                creditsRequired: 'Produced by OTP Records',
                jurisdiction: 'Spain'
            },
            'Premium': {
                templateId: `premium-${Date.now()}`,
                tier: 'Premium',
                displayName: 'Premium License',
                version: '2026-04-17',
                body: 'Premium non-exclusive license for commercial use.',
                limits: {
                    distributionLimit: 10000,
                    audioStreams: 500000,
                    musicVideos: 1,
                    forProfitPerformances: true,
                    radioBroadcasting: 2,
                    contentIdAllowed: false
                },
                publishingSplit: { producerTotalShare: 50, licenseeShare: 50 },
                creditsRequired: 'Produced by OTP Records',
                jurisdiction: 'Spain'
            },
            'Unlimited': {
                templateId: `unlimited-${Date.now()}`,
                tier: 'Unlimited',
                displayName: 'Unlimited License',
                version: '2026-04-17',
                body: 'Unlimited non-exclusive license for unrestricted commercial use.',
                limits: {
                    distributionLimit: 0,
                    audioStreams: 0,
                    musicVideos: 0,
                    forProfitPerformances: true,
                    radioBroadcasting: 0,
                    contentIdAllowed: false
                },
                publishingSplit: { producerTotalShare: 50, licenseeShare: 50 },
                creditsRequired: 'Produced by OTP Records',
                jurisdiction: 'Spain'
            }
        };

        const templateData = templates[tier];
        if (!templateData) throw new Error(`Invalid tier: ${tier}`);
        return await LicenseTemplate.create(templateData);
    }

    async issueLicense(purchaseData) {
        const {
            orderId, stripeSessionId, beatId, beatTitle, beatBpm, beatKey,
            tier, buyerLegalName, buyerEmail, buyerAddress,
            producers = [], beatFormats = [], beatTerms = {},
            amount, currency = 'EUR'
        } = purchaseData;

        const template = await this.getLicenseTemplate(tier);
        const licenseId = crypto.randomUUID();
        const licenseNumber = await this.generateLicenseNumber();

        // Per-producer publishing split
        const producerTotalShare = template.publishingSplit?.producerTotalShare ?? 50;
        const licenseeShare = template.publishingSplit?.licenseeShare ?? 50;
        const perProducerShare = producers.length > 0
            ? Math.round(producerTotalShare / producers.length)
            : producerTotalShare;

        const publishingSplitSnapshot = {
            producers: producers.map(p => ({ name: p.name, share: perProducerShare })),
            licenseeShare
        };

        // Dynamic credits
        const names = producers.map(p => p.name);
        let creditsRequired;
        if (names.length === 0) {
            creditsRequired = template.creditsRequired || 'Produced by OTP Records';
        } else if (names.length === 1) {
            creditsRequired = `Produced by ${names[0]}`;
        } else {
            creditsRequired = `Produced by ${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
        }

        // Limits snapshot from the actual beat license terms
        const limitsSnapshot = {
            distributionLimit: beatTerms.distributionLimit ?? 0,
            audioStreams: beatTerms.audioStreams ?? 0,
            musicVideos: beatTerms.musicVideos ?? 1,
            forProfitPerformances: beatTerms.forProfitPerformances ?? false,
            radioBroadcasting: beatTerms.radioBroadcasting ?? 0,
            contentIdAllowed: false
        };

        const issuedAt = new Date();
        const verifyUrl = `${process.env.FRONTEND_URL || 'https://otprecords.com'}/verify-license/${licenseId}`;

        const licenseData = {
            licenseId, licenseNumber,
            templateId: template.templateId,
            templateVersion: template.version,
            tier, orderId, stripeSessionId,
            beatId, beatTitle, beatBpm, beatKey,
            producers,
            buyerLegalName, buyerEmail,
            buyerAddress: buyerAddress || '',
            beatFormats,
            limitsSnapshot, publishingSplitSnapshot,
            creditsRequired,
            jurisdiction: template.jurisdiction || 'Spain',
            amount, currency,
            status: 'Issued',
            issuedAt, verifyUrl
        };

        licenseData.documentHash = this.generateDocumentHash(licenseData);
        return await IssuedLicense.create(licenseData);
    }

    async generateLicensePDF(issuedLicense) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 60, bottom: 60, left: MARGIN, right: MARGIN }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                const qrBuffer = Buffer.from(
                    (await QRCode.toDataURL(issuedLicense.verifyUrl, { width: 120, margin: 1 })).split(',')[1],
                    'base64'
                );

                const contentWidth = doc.page.width - MARGIN * 2;
                const effectiveDate = new Date(issuedLicense.issuedAt).toLocaleDateString('es-ES');

                // ── Helpers ──────────────────────────────────────────────
                const needPage = (minSpace = PAGE_BOTTOM_THRESHOLD) => {
                    if (doc.y > doc.page.height - doc.page.margins.bottom - minSpace) {
                        doc.addPage();
                    }
                };

                const rule = () => {
                    doc.moveDown(0.6);
                    doc.moveTo(MARGIN, doc.y)
                       .lineTo(MARGIN + contentWidth, doc.y)
                       .strokeColor('#cccccc').lineWidth(0.5).stroke();
                    doc.moveDown(0.6);
                };

                const sectionHeader = (num, text) => {
                    needPage(150);
                    rule();
                    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000000')
                       .text(`${num}. ${text}`);
                    doc.moveDown(0.4);
                };

                const body = (text, opts = {}) => {
                    doc.font('Helvetica').fontSize(10).fillColor('#000000')
                       .text(text, { align: 'justify', ...opts });
                };

                const bullet = (items) => {
                    doc.font('Helvetica').fontSize(10).fillColor('#000000')
                       .list(items, { bulletRadius: 2, indent: 15, textIndent: 10 });
                };

                const fmt = (v) => {
                    if (v === 0 || v === -1) return 'Unlimited';
                    return v.toLocaleString('es-ES');
                };

                // ── Build producers string ────────────────────────────────
                const producers = issuedLicense.producers || [];
                const producerNames = producers.map(p => p.name);
                let producersStr;
                if (producerNames.length === 0) {
                    producersStr = 'the Producer';
                } else if (producerNames.length === 1) {
                    producersStr = producerNames[0];
                } else {
                    producersStr = producerNames.slice(0, -1).join(', ') + ', and ' + producerNames[producerNames.length - 1];
                }

                const tierDisplay = issuedLicense.tier;
                const limits = issuedLicense.limitsSnapshot || {};
                const split = issuedLicense.publishingSplitSnapshot || {};

                // ════════════════════════════════════════════════════════
                // TITLE
                // ════════════════════════════════════════════════════════
                doc.font('Helvetica-Bold').fontSize(15).fillColor('#000000')
                   .text('NON-EXCLUSIVE BEAT LICENSE AGREEMENT', { align: 'center' });
                doc.moveDown(0.4);
                doc.font('Helvetica').fontSize(9).fillColor('#444444')
                   .text(`License No: ${issuedLicense.licenseNumber}`, { align: 'center' });
                doc.moveDown(0.15);
                doc.font('Helvetica').fontSize(9).fillColor('#444444')
                   .text(`Issued: ${effectiveDate}`, { align: 'center' });

                rule();

                // ── Opening paragraphs ────────────────────────────────────
                body(
                    `This Non-Exclusive ${tierDisplay} License Agreement (the "Agreement") is made effective as of ` +
                    `${effectiveDate} (the "Effective Date") by and between ${producersStr} ` +
                    `(collectively, the "Producers" or "Licensors"), and ${issuedLicense.buyerLegalName}, ` +
                    `residing at ${issuedLicense.buyerAddress || 'address on file'} (the "Licensee").`
                );
                doc.moveDown(0.5);

                body(
                    `Licensor hereby grants Licensee certain limited rights in the instrumental music ` +
                    `composition entitled ${issuedLicense.beatTitle} (the "Beat") in consideration for ` +
                    `the payment of ${issuedLicense.amount.toFixed(2)}€ (the "License Fee").`
                );
                doc.moveDown(0.5);

                body(
                    'The license granted under this Agreement is perpetual. Licensee may use the Beat ' +
                    'and the New Song indefinitely, subject to compliance with all terms of this Agreement.'
                );

                // ════════════════════════════════════════════════════════
                // §1. License Fee
                // ════════════════════════════════════════════════════════
                sectionHeader(1, 'License Fee');
                body(
                    'The Licensee shall pay the License Fee in full prior to receiving the Beat. All rights ' +
                    'granted under this Agreement are conditional upon payment of the License Fee. This ' +
                    'Agreement shall not become effective until such payment has been made.'
                );

                // ════════════════════════════════════════════════════════
                // §2. Delivery
                // ════════════════════════════════════════════════════════
                sectionHeader(2, 'Delivery');
                const formats = issuedLicense.beatFormats && issuedLicense.beatFormats.length > 0
                    ? issuedLicense.beatFormats.join(' & ')
                    : 'MP3 & WAV';
                body(
                    `Upon receipt of payment, Licensors agree to deliver the Beat to Licensee in ${formats} ` +
                    'format via email or digital download.'
                );

                // ════════════════════════════════════════════════════════
                // §3. Grant of License
                // ════════════════════════════════════════════════════════
                sectionHeader(3, 'Grant of License');
                body(
                    'Licensors hereby grant Licensee a non-exclusive, non-transferable, worldwide license to ' +
                    'use the Beat solely for the purpose of creating one (1) new musical composition (the "New Song").'
                );
                doc.moveDown(0.4);
                body('Licensee may record vocals or other musical elements over the Beat to create the New Song.');
                doc.moveDown(0.4);
                body(
                    'Licensee may also modify the Beat for the purposes of the New Song, including changes to ' +
                    'arrangement, tempo, pitch, or structure.'
                );

                // ════════════════════════════════════════════════════════
                // §4. Permitted Uses
                // ════════════════════════════════════════════════════════
                sectionHeader(4, 'Permitted Uses');
                body('The New Song may be used for promotional and commercial purposes, including:');
                doc.moveDown(0.3);

                const permittedUses = [
                    'Release as a single',
                    'Inclusion in a mixtape, EP, or album',
                    'Distribution on digital platforms',
                    'Digital streaming'
                ];
                if (limits.forProfitPerformances) permittedUses.push('Profit live performances');
                if (limits.radioBroadcasting > 0) {
                    permittedUses.push(
                        `Radio broadcast: up to ${limits.radioBroadcasting} station${limits.radioBroadcasting > 1 ? 's' : ''}`
                    );
                }
                bullet(permittedUses);

                doc.moveDown(0.4);
                body('Licensee may distribute and exploit the New Song subject to the following limits:');
                doc.moveDown(0.3);

                const distLimits = [
                    `${fmt(limits.distributionLimit)} copies sold (physical or digital)`,
                    `${fmt(limits.audioStreams)} audio streams`,
                    'Unlimited free downloads'
                ];
                if (limits.musicVideos !== undefined) {
                    distLimits.push(`${fmt(limits.musicVideos)} music video${limits.musicVideos === 1 ? '' : 's'}`);
                }
                bullet(distLimits);

                doc.moveDown(0.4);
                body(
                    'Use in short-form videos on social media (TikTok, Instagram Reels, YouTube Shorts) is ' +
                    'permitted without limitation.'
                );

                // ════════════════════════════════════════════════════════
                // §5. Non-Exclusive Rights
                // ════════════════════════════════════════════════════════
                sectionHeader(5, 'Non-Exclusive Rights');
                body(
                    'Licensee acknowledges that this license is non-exclusive. Licensors retain the right to ' +
                    'license the Beat to other parties.'
                );
                doc.moveDown(0.4);
                body(
                    'Licensors retain full ownership and control of the Beat and may continue to sell, license, ' +
                    'or otherwise exploit the Beat.'
                );

                // ════════════════════════════════════════════════════════
                // §6. Restrictions
                // ════════════════════════════════════════════════════════
                sectionHeader(6, 'Restrictions');
                body('Licensee shall not:');
                doc.moveDown(0.3);
                [
                    'Sell, lease, sublicense, distribute, or otherwise transfer the Beat in its original form.',
                    'Claim ownership of the Beat.',
                    'Use the Beat in any unlawful manner.',
                    'Register the Beat with any copyright office or claim ownership of the Beat.'
                ].forEach((item, i) => {
                    doc.font('Helvetica').fontSize(10).fillColor('#000000')
                       .text(`${i + 1}. ${item}`, MARGIN + 15, doc.y, { width: contentWidth - 15 });
                    doc.moveDown(0.25);
                });
                doc.moveDown(0.2);
                body(
                    'Licensee may not register the Beat or the New Song with any Content ID or similar ' +
                    'fingerprinting system unless the Beat has been purchased with an exclusive license.'
                );

                // ════════════════════════════════════════════════════════
                // §7. Ownership
                // ════════════════════════════════════════════════════════
                sectionHeader(7, 'Ownership');
                body(
                    'Licensors remain the sole owner of the Beat, including all copyrights in the musical ' +
                    'composition and sound recording.'
                );
                doc.moveDown(0.4);
                body(
                    'Licensee owns only the lyrics and original musical elements added by Licensee in the New Song.'
                );

                // ════════════════════════════════════════════════════════
                // §8. Publishing Split
                // ════════════════════════════════════════════════════════
                sectionHeader(8, 'Publishing Split');
                body('With respect to the underlying composition embodied in the New Song:');
                doc.moveDown(0.3);

                const splitItems = (split.producers || []).map(p => `${p.name}: ${p.share}% Publisher's Share`);
                splitItems.push(`Licensee: ${split.licenseeShare ?? 50}% Writer's Share`);
                bullet(splitItems);

                doc.moveDown(0.4);
                body(
                    'If the New Song is registered with a Performing Rights Organization (PRO), Licensee agrees ' +
                    'to properly credit Producers\' ownership share.'
                );
                doc.moveDown(0.4);
                body(
                    'Licensee shall not be required to pay any additional royalties or fees to Producers beyond ' +
                    'the License Fee, except as expressly provided for in the publishing split above.'
                );

                // ════════════════════════════════════════════════════════
                // §9. Credit
                // ════════════════════════════════════════════════════════
                sectionHeader(9, 'Credit');
                body('Licensee agrees to credit the Producers in substantially the following form:');
                doc.moveDown(0.4);
                doc.font('Helvetica-Oblique').fontSize(10).fillColor('#000000')
                   .text(`"${issuedLicense.creditsRequired}"`, { align: 'center' });
                doc.moveDown(0.4);
                body(
                    'Credits should appear where music production credits are normally listed, including digital ' +
                    'platforms where applicable.'
                );

                // ════════════════════════════════════════════════════════
                // §10. Breach and Termination
                // ════════════════════════════════════════════════════════
                sectionHeader(10, 'Breach and Termination');
                body(
                    'If Licensee breaches any material term of this Agreement and fails to cure such breach within ' +
                    'five (5) business days after written notice, Licensors may terminate this license.'
                );
                doc.moveDown(0.4);
                body(
                    'Upon termination, Licensee must immediately cease distribution and exploitation of the New Song.'
                );

                // ════════════════════════════════════════════════════════
                // §11. Limitation of Liability
                // ════════════════════════════════════════════════════════
                sectionHeader(11, 'Limitation of Liability');
                body(
                    'The Beat is provided "as is" without warranties of any kind. Licensors shall not be liable ' +
                    'for any damages arising from the use of the Beat.'
                );

                // ════════════════════════════════════════════════════════
                // §12. Governing Law
                // ════════════════════════════════════════════════════════
                sectionHeader(12, 'Governing Law');
                body(`This Agreement shall be governed by the laws of ${issuedLicense.jurisdiction || 'Spain'}.`);

                // ════════════════════════════════════════════════════════
                // §13. Acceptance
                // ════════════════════════════════════════════════════════
                sectionHeader(13, 'Acceptance');
                body(
                    'Licensee acknowledges that payment of the License Fee and acceptance of this Agreement ' +
                    'constitutes full agreement to all terms stated herein.'
                );

                // ── Signature block ───────────────────────────────────────
                needPage(180);
                doc.moveDown(1.5);

                doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('Licensors:');
                producers.forEach(p => {
                    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#000000').text(p.name);
                });
                doc.moveDown(0.8);
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('Licensee:');
                doc.font('Helvetica-Oblique').fontSize(10).fillColor('#000000')
                   .text(issuedLicense.buyerLegalName);
                doc.moveDown(0.3);
                doc.font('Helvetica').fontSize(10).fillColor('#000000').text(`Date: ${effectiveDate}`);

                // ── QR + Verification footer ──────────────────────────────
                needPage(160);
                doc.moveDown(1.5);
                rule();

                doc.font('Helvetica').fontSize(8).fillColor('#555555')
                   .text('DOCUMENT VERIFICATION', { align: 'center' });
                doc.moveDown(0.5);

                const qrSize = 90;
                const qrX = (doc.page.width - qrSize) / 2;
                const qrY = doc.y;
                doc.image(qrBuffer, qrX, qrY, { width: qrSize });
                doc.y = qrY + qrSize + 10;

                doc.font('Helvetica').fontSize(7).fillColor('#555555')
                   .text(`License ID: ${issuedLicense.licenseId}`, { align: 'center' })
                   .text(`Hash: ${issuedLicense.documentHash.substring(0, 32)}...`, { align: 'center' })
                   .text(issuedLicense.verifyUrl, { align: 'center', link: issuedLicense.verifyUrl });
                doc.moveDown(0.5);
                doc.font('Helvetica').fontSize(6).fillColor('#999999')
                   .text('This document was generated electronically and is valid without signature.', { align: 'center' })
                   .text(`Generated on ${new Date().toLocaleString('es-ES')}`, { align: 'center' });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    async verifyLicense(identifier) {
        const license = await IssuedLicense.findOne({
            $or: [{ licenseId: identifier }, { licenseNumber: identifier }]
        }).populate('beatId').populate('orderId');

        if (!license) return { valid: false, message: 'Licencia no encontrada' };

        if (license.status !== 'Issued') {
            return { valid: false, message: `Licencia ${license.status.toLowerCase()}`, license };
        }

        return { valid: true, message: 'Licencia válida', license };
    }
}

module.exports = new LicenseService();
