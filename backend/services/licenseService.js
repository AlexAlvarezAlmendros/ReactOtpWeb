const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const LicenseTemplate = require('../models/LicenseTemplate');
const IssuedLicense = require('../models/IssuedLicense');
const fs = require('fs');
const path = require('path');

class LicenseService {
    /**
     * Generate a unique license number
     * Format: LILBRU-YYYY-NNNNNN
     */
    async generateLicenseNumber() {
        const year = new Date().getFullYear();
        const prefix = `LILBRU-${year}-`;
        
        // Get the count of licenses issued this year
        const startOfYear = new Date(year, 0, 1);
        const count = await IssuedLicense.countDocuments({
            issuedAt: { $gte: startOfYear }
        });
        
        // Zero-pad to 6 digits
        const number = String(count + 1).padStart(6, '0');
        
        return `${prefix}${number}`;
    }

    /**
     * Generate a document hash for verification
     */
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

    /**
     * Get or create license template by tier
     */
    async getLicenseTemplate(tier) {
        let template = await LicenseTemplate.findOne({ 
            tier, 
            active: true 
        }).sort({ version: -1 });

        if (!template) {
            // Create default template if none exists
            template = await this.createDefaultTemplate(tier);
        }

        return template;
    }

    /**
     * Create default license templates
     */
    async createDefaultTemplate(tier) {
        const templates = {
            'Basic': {
                templateId: `basic-${Date.now()}`,
                tier: 'Basic',
                displayName: 'Licencia Básica',
                version: '2026-02-06',
                body: this.getBasicLicenseText(),
                limits: {
                    maxStreams: 50000,
                    maxMonetizedVideos: 1,
                    maxPhysicalCopies: 0,
                    contentIdAllowed: false,
                    forProfitPerformances: false,
                    radioBroadcasting: false
                }
            },
            'Premium': {
                templateId: `premium-${Date.now()}`,
                tier: 'Premium',
                displayName: 'Licencia Premium',
                version: '2026-02-06',
                body: this.getPremiumLicenseText(),
                limits: {
                    maxStreams: 500000,
                    maxMonetizedVideos: 1,
                    maxPhysicalCopies: 10000,
                    contentIdAllowed: false,
                    forProfitPerformances: true,
                    radioBroadcasting: true
                }
            },
            'Unlimited': {
                templateId: `unlimited-${Date.now()}`,
                tier: 'Unlimited',
                displayName: 'Licencia Unlimited',
                version: '2026-02-06',
                body: this.getUnlimitedLicenseText(),
                limits: {
                    maxStreams: 0, // 0 = unlimited
                    maxMonetizedVideos: 0,
                    maxPhysicalCopies: 0,
                    contentIdAllowed: false,
                    forProfitPerformances: true,
                    radioBroadcasting: true
                }
            }
        };

        const templateData = templates[tier];
        if (!templateData) {
            throw new Error(`Invalid tier: ${tier}`);
        }

        return await LicenseTemplate.create(templateData);
    }

    /**
     * Issue a new license for a purchase
     */
    async issueLicense(purchaseData) {
        const {
            orderId,
            stripeSessionId,
            beatId,
            beatTitle,
            beatBpm,
            beatKey,
            tier,
            buyerLegalName,
            buyerEmail,
            amount,
            currency = 'EUR'
        } = purchaseData;

        // Get license template
        const template = await this.getLicenseTemplate(tier);
        
        // Generate unique identifiers
        const licenseId = crypto.randomUUID();
        const licenseNumber = await this.generateLicenseNumber();
        
        // Create license data
        const licenseData = {
            licenseId,
            licenseNumber,
            templateId: template.templateId,
            templateVersion: template.version,
            tier,
            orderId,
            stripeSessionId,
            beatId,
            beatTitle,
            beatBpm,
            beatKey,
            producerName: 'LilBru',
            buyerLegalName,
            buyerEmail,
            limitsSnapshot: template.limits,
            publishingSplitSnapshot: template.publishingSplit,
            creditsRequired: template.creditsRequired,
            jurisdiction: template.jurisdiction,
            amount,
            currency,
            status: 'Issued',
            issuedAt: new Date(),
            verifyUrl: `${process.env.FRONTEND_URL || 'https://otprecords.com'}/verify-license/${licenseId}`
        };

        // Generate document hash
        licenseData.documentHash = this.generateDocumentHash(licenseData);

        // Save to database
        const issuedLicense = await IssuedLicense.create(licenseData);

        return issuedLicense;
    }

    /**
     * Generate PDF license document
     */
    async generateLicensePDF(issuedLicense) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Generate QR Code
                const qrCodeDataUrl = await QRCode.toDataURL(issuedLicense.verifyUrl, {
                    width: 150,
                    margin: 1
                });

                // Header with logo/title
                doc.fontSize(24)
                   .fillColor('#ff003c')
                   .text('CONTRATO DE LICENCIA DE BEAT', { align: 'center' })
                   .moveDown(0.5);

                doc.fontSize(12)
                   .fillColor('#000000')
                   .text(`Número de Licencia: ${issuedLicense.licenseNumber}`, { align: 'center' })
                   .moveDown(0.3);

                doc.fontSize(10)
                   .fillColor('#666666')
                   .text(`Fecha de emisión: ${issuedLicense.issuedAt.toLocaleDateString('es-ES')}`, { align: 'center' })
                   .moveDown(2);

                // License Details Box
                doc.roundedRect(50, doc.y, doc.page.width - 100, 120, 5)
                   .fillAndStroke('#f5f5f5', '#cccccc')
                   .fillColor('#000000');

                const boxY = doc.y + 15;
                doc.fontSize(10)
                   .text('DETALLES DE LA LICENCIA', 70, boxY, { underline: true })
                   .moveDown(0.5);

                doc.fontSize(9)
                   .text(`Beat: ${issuedLicense.beatTitle}`, 70)
                   .text(`Tipo de Licencia: ${issuedLicense.tier}`, 70)
                   .text(`Productor: ${issuedLicense.producerName}`, 70)
                   .text(`Licenciatario: ${issuedLicense.buyerLegalName}`, 70)
                   .text(`Email: ${issuedLicense.buyerEmail}`, 70);

                if (issuedLicense.beatBpm) {
                    doc.text(`BPM: ${issuedLicense.beatBpm}`, 70);
                }
                if (issuedLicense.beatKey) {
                    doc.text(`Key: ${issuedLicense.beatKey}`, 70);
                }

                doc.moveDown(2);

                // Main Content - Partes
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('1. PARTES', { underline: true })
                   .moveDown(0.5);

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text(`Este contrato se establece entre ${issuedLicense.producerName} (en adelante, "el Productor") y ${issuedLicense.buyerLegalName} (en adelante, "el Licenciatario").`, {
                       align: 'justify'
                   })
                   .moveDown(1.5);

                // Propiedad
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('2. PROPIEDAD INTELECTUAL', { underline: true })
                   .moveDown(0.5);

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text(`El Productor retiene todos los derechos de propiedad intelectual sobre el beat "${issuedLicense.beatTitle}". Esta licencia otorga derechos de uso específicos pero no transfiere la propiedad del beat.`, {
                       align: 'justify'
                   })
                   .moveDown(1.5);

                // Derechos
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('3. DERECHOS OTORGADOS', { underline: true })
                   .moveDown(0.5);

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text('El Licenciatario tiene derecho a:', {
                       align: 'justify'
                   })
                   .list([
                       'Grabar y producir composiciones musicales',
                       'Distribuir el contenido en plataformas digitales',
                       'Monetizar el contenido según los límites establecidos',
                       'Realizar actuaciones con el contenido creado'
                   ], { bulletRadius: 2 })
                   .moveDown(1.5);

                // Limitaciones
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('4. LIMITACIONES Y RESTRICCIONES', { underline: true })
                   .moveDown(0.5);

                const limits = issuedLicense.limitsSnapshot;
                const formatLimit = (value) => value === 0 ? 'Ilimitado' : value.toLocaleString('es-ES');

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text('Esta licencia está sujeta a las siguientes limitaciones:')
                   .moveDown(0.5);

                doc.list([
                    `Reproducciones en streaming: ${formatLimit(limits.maxStreams)}`,
                    `Videos monetizados: ${formatLimit(limits.maxMonetizedVideos)}`,
                    `Copias físicas: ${formatLimit(limits.maxPhysicalCopies)}`,
                    `Content ID: ${limits.contentIdAllowed ? 'Permitido' : 'No permitido'}`,
                    `Actuaciones con ánimo de lucro: ${limits.forProfitPerformances ? 'Permitido' : 'No permitido'}`,
                    `Radiodifusión: ${limits.radioBroadcasting ? 'Permitido' : 'No permitido'}`
                ], { bulletRadius: 2 })
                .moveDown(1.5);

                // Check if we need a new page
                if (doc.y > 650) {
                    doc.addPage();
                }

                // Créditos
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('5. CRÉDITOS', { underline: true })
                   .moveDown(0.5);

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text(`El Licenciatario debe acreditar al Productor en todas las publicaciones con: "${issuedLicense.creditsRequired}"`, {
                       align: 'justify'
                   })
                   .moveDown(1.5);

                // Publishing Split
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('6. DERECHOS DE AUTOR Y PUBLISHING', { underline: true })
                   .moveDown(0.5);

                const split = issuedLicense.publishingSplitSnapshot;
                doc.fontSize(10)
                   .fillColor('#000000')
                   .text(`Los derechos de autor (publishing) se dividen de la siguiente manera:`)
                   .moveDown(0.5)
                   .list([
                       `Productor (${issuedLicense.producerName}): ${split.producer}%`,
                       `Licenciatario (${issuedLicense.buyerLegalName}): ${split.licensee}%`
                   ], { bulletRadius: 2 })
                   .moveDown(1.5);

                // Master Rights
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('7. DERECHOS DE MASTER', { underline: true })
                   .moveDown(0.5);

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text('El Productor retiene el 100% de los derechos de master del beat original. El Licenciatario posee los derechos de la grabación vocal y la composición final.', {
                       align: 'justify'
                   })
                   .moveDown(1.5);

                // Jurisdiction
                doc.fontSize(12)
                   .fillColor('#ff003c')
                   .text('8. JURISDICCIÓN', { underline: true })
                   .moveDown(0.5);

                doc.fontSize(10)
                   .fillColor('#000000')
                   .text(`Este contrato se rige por las leyes de ${issuedLicense.jurisdiction}.`, {
                       align: 'justify'
                   })
                   .moveDown(2);

                // Footer with QR Code and verification
                if (doc.y > 600) {
                    doc.addPage();
                }

                doc.fontSize(9)
                   .fillColor('#666666')
                   .text('VERIFICACIÓN DE AUTENTICIDAD', { align: 'center' })
                   .moveDown(0.5);

                // Add QR Code
                const qrSize = 100;
                const qrX = doc.page.width / 2 - qrSize / 2;
                const qrY = doc.y;
                
                const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
                doc.image(qrBuffer, qrX, qrY, { width: qrSize });
                
                // Position text below the QR code
                const textStartY = qrY + qrSize + 10; // QR height + 10px spacing
                doc.y = textStartY;

                doc.fontSize(8)
                   .fillColor('#666666')
                   .text(`License ID: ${issuedLicense.licenseId}`, { align: 'center' })
                   .text(`Hash: ${issuedLicense.documentHash.substring(0, 32)}...`, { align: 'center' })
                   .text(`Verifica en: ${issuedLicense.verifyUrl}`, { align: 'center', link: issuedLicense.verifyUrl })
                   .moveDown(1);

                doc.fontSize(7)
                   .fillColor('#999999')
                   .text('Este documento fue generado electrónicamente y es válido sin firma.', { align: 'center' })
                   .text(`Generado el ${new Date().toLocaleString('es-ES')}`, { align: 'center' });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * License text templates
     */
    getBasicLicenseText() {
        return 'Licencia básica para uso no comercial con limitaciones en reproducciones streaming.';
    }

    getPremiumLicenseText() {
        return 'Licencia premium para uso comercial con límites extendidos en reproducciones y distribución física.';
    }

    getUnlimitedLicenseText() {
        return 'Licencia ilimitada para uso comercial sin restricciones en reproducciones, distribución y monetización.';
    }

    /**
     * Verify a license by ID or number
     */
    async verifyLicense(identifier) {
        const license = await IssuedLicense.findOne({
            $or: [
                { licenseId: identifier },
                { licenseNumber: identifier }
            ]
        }).populate('beatId').populate('orderId');

        if (!license) {
            return {
                valid: false,
                message: 'Licencia no encontrada'
            };
        }

        if (license.status !== 'Issued') {
            return {
                valid: false,
                message: `Licencia ${license.status.toLowerCase()}`,
                license
            };
        }

        return {
            valid: true,
            message: 'Licencia válida',
            license
        };
    }
}

module.exports = new LicenseService();
