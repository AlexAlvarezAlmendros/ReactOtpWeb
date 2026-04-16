const nodemailer = require('nodemailer');
const React = require('react');
const { render } = require('@react-email/render');

// Lazy load email templates to avoid Babel issues
let NewsletterEmail, BeatPurchaseEmail;
try {
  // Try to require with Babel if available (development)
  require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react'],
    extensions: ['.js', '.jsx'],
    only: [/emails/],
    cache: false
  });
  NewsletterEmail = require('../emails/NewsletterEmail').default;
  BeatPurchaseEmail = require('../emails/BeatPurchaseEmail').default;
} catch (error) {
  console.log('⚠️  React email templates not available, using fallback HTML templates');
  NewsletterEmail = null;
  BeatPurchaseEmail = null;
}


class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Verificar que las variables de entorno estén configuradas
            if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
                console.error('❌ Email configuration missing:');
                console.error('   GMAIL_USER:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
                console.error('   GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
                console.error('   Please configure Gmail credentials in .env file');
                this.transporter = null;
                return;
            }

            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD
                },
                secure: true,
                tls: {
                    rejectUnauthorized: false
                }
            });

            console.log('📧 Email service initialized successfully');
            console.log('   Gmail User:', process.env.GMAIL_USER);
            console.log('   From Name:', process.env.EMAIL_FROM_NAME || 'OTP Records');
        } catch (error) {
            console.error('❌ Error initializing email service:', error.message);
            this.transporter = null;
        }
    }

    async verifyConnection() {
        try {
            if (!this.transporter) {
                return { 
                    success: false, 
                    message: 'Email service not initialized. Check Gmail configuration in .env file.' 
                };
            }
            
            await this.transporter.verify();
            return { success: true, message: 'Email service is ready' };
        } catch (error) {
            console.error('❌ Email service verification failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    async sendContactEmail(contactData) {
        const { name, email, subject, message } = contactData;

        try {
            // Verificar que el transporter esté inicializado
            if (!this.transporter) {
                throw new Error('Email service not initialized. Please check Gmail configuration.');
            }

            // Email to admin (you receive the contact form)
            const adminEmailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'OTP Records',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER
                },
                to: process.env.GMAIL_USER, // Admin email
                subject: `[CONTACTO] ${subject}`,
                html: this.generateAdminEmailTemplate(name, email, subject, message),
                text: this.generateAdminEmailText(name, email, subject, message)
            };

            // Email to user (confirmation they sent the message)
            const userEmailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'OTP Records',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER
                },
                to: email,
                subject: `Confirmación: ${subject}`,
                html: this.generateUserConfirmationTemplate(name, subject),
                text: this.generateUserConfirmationText(name, subject)
            };

            console.log('📧 Sending emails...');
            console.log('   Admin email to:', process.env.GMAIL_USER);
            console.log('   User confirmation to:', email);

            // Send both emails
            const [adminResult, userResult] = await Promise.allSettled([
                this.transporter.sendMail(adminEmailOptions),
                this.transporter.sendMail(userEmailOptions)
            ]);

            console.log('📧 Email results:');
            console.log('   Admin email:', adminResult.status);
            console.log('   User email:', userResult.status);

            return {
                success: true,
                adminEmail: adminResult.status === 'fulfilled' ? adminResult.value : null,
                userEmail: userResult.status === 'fulfilled' ? userResult.value : null,
                errors: {
                    admin: adminResult.status === 'rejected' ? adminResult.reason.message : null,
                    user: userResult.status === 'rejected' ? userResult.reason.message : null
                }
            };

        } catch (error) {
            console.error('❌ Error sending contact email:', error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    generateAdminEmailTemplate(name, email, subject, message) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Nuevo Mensaje de Contacto</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1DB954; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .message-box { background: white; padding: 15px; border-left: 4px solid #1DB954; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Nuevo Mensaje de Contacto</h1>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">Nombre:</span> ${name}
                    </div>
                    <div class="field">
                        <span class="label">Email:</span> ${email}
                    </div>
                    <div class="field">
                        <span class="label">Asunto:</span> ${subject}
                    </div>
                    <div class="field">
                        <span class="label">Mensaje:</span>
                        <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
                    </div>
                    <div class="field">
                        <span class="label">Fecha:</span> ${new Date().toLocaleString('es-ES')}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateAdminEmailText(name, email, subject, message) {
        return `
NUEVO MENSAJE DE CONTACTO

Nombre: ${name}
Email: ${email}
Asunto: ${subject}

Mensaje:
${message}

Fecha: ${new Date().toLocaleString('es-ES')}
        `.trim();
    }

    generateUserConfirmationTemplate(name, subject) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Mensaje Recibido - OTP Records</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1DB954; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Mensaje Recibido!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${name}</strong>,</p>
                    <p>Hemos recibido tu mensaje con el asunto "<strong>${subject}</strong>" y te responderemos lo antes posible.</p>
                    <p>Normalmente respondemos en un plazo de 24-48 horas durante días laborables.</p>
                    <p>¡Gracias por contactar con OTP Records!</p>
                </div>
                <div class="footer">
                    <p>Este es un email automático, por favor no respondas a este mensaje.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateUserConfirmationText(name, subject) {
        return `
Hola ${name},

Hemos recibido tu mensaje con el asunto "${subject}" y te responderemos lo antes posible.

Normalmente respondemos en un plazo de 24-48 horas durante días laborables.

¡Gracias por contactar con OTP Records!

---
Este es un email automático, por favor no respondas a este mensaje.
        `.trim();
    }

    /**
     * Envía el ticket por email al comprador con PDF adjunto
     */
    async sendTicketEmailWithPDF(ticket, event, pdfBuffer) {
        try {
            // Verificar que el transporter esté inicializado
            if (!this.transporter) {
                throw new Error('Email service not initialized. Please check Gmail configuration.');
            }

            const emailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Other People Records',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER
                },
                to: ticket.customerEmail,
                subject: `${ticket.purchaseQuantity > 1 ? 'Tus entradas' : 'Tu entrada'} para ${event.name}`,
                html: this.generateTicketEmailTemplate(ticket, event.name, event),
                text: this.generateTicketEmailText(ticket, event.name, event),
                attachments: [
                    {
                        filename: `tickets-${event.name.replace(/[^a-z0-9]/gi, '-')}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };

            console.log('🎫 Sending ticket email with PDF to:', ticket.customerEmail);

            const result = await this.transporter.sendMail(emailOptions);

            console.log('✅ Ticket email with PDF sent successfully');
            
            return {
                success: true,
                result: result
            };

        } catch (error) {
            console.error('❌ Error sending ticket email with PDF:', error.message);
            throw new Error(`Failed to send ticket email: ${error.message}`);
        }
    }

    /**
     * Envía el ticket por email al comprador
     */
    async sendTicketEmail(ticket, eventName, event) {
        try {
            // Verificar que el transporter esté inicializado
            if (!this.transporter) {
                throw new Error('Email service not initialized. Please check Gmail configuration.');
            }

            const emailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Other People Records',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER
                },
                to: ticket.customerEmail,
                subject: `Tu entrada para ${eventName}`,
                html: this.generateTicketEmailTemplate(ticket, eventName, event),
                text: this.generateTicketEmailText(ticket, eventName, event),
                attachments: [{
                    filename: 'ticket-qr.png',
                    content: ticket.qrCode.split('base64,')[1],
                    encoding: 'base64',
                    cid: 'qrcode'
                }]
            };

            console.log('🎫 Sending ticket email to:', ticket.customerEmail);

            const result = await this.transporter.sendMail(emailOptions);

            console.log('✅ Ticket email sent successfully');
            
            return {
                success: true,
                result: result
            };

        } catch (error) {
            console.error('❌ Error sending ticket email:', error.message);
            throw new Error(`Failed to send ticket email: ${error.message}`);
        }
    }

    generateTicketEmailTemplate(ticket, eventName, event) {
        const eventDate = event && event.date ? new Date(event.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'Fecha por confirmar';

        const eventLocation = event && event.location ? event.location : 'Ubicación por confirmar';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Tu entrada para ${eventName}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    background-color: #f4f4f4;
                }
                .container { 
                    max-width: 600px; 
                    margin: 20px auto; 
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header { 
                    background: linear-gradient(135deg, #ff003c 0%, #cc0030 100%);
                    color: white; 
                    padding: 30px 20px; 
                    text-align: center; 
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content { 
                    padding: 30px 20px; 
                }
                .ticket-info {
                    background: #f9f9f9;
                    border-left: 4px solid #ff003c;
                    padding: 20px;
                    margin: 20px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                .info-label {
                    font-weight: bold;
                    color: #555;
                }
                .info-value {
                    color: #333;
                }
                .qr-section {
                    text-align: center;
                    margin: 30px 0;
                    padding: 20px;
                    background: #fff;
                    border: 2px dashed #ff003c;
                    border-radius: 10px;
                }
                .qr-code {
                    max-width: 250px;
                    margin: 20px auto;
                }
                .ticket-code {
                    font-size: 18px;
                    font-weight: bold;
                    color: #ff003c;
                    letter-spacing: 2px;
                    margin: 15px 0;
                }
                .important-note {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer { 
                    text-align: center; 
                    padding: 20px; 
                    background: #f9f9f9;
                    color: #666; 
                    font-size: 14px; 
                }
                .btn {
                    display: inline-block;
                    padding: 12px 30px;
                    background: #ff003c;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 ¡Gracias por tu compra!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">Tu entrada está confirmada</p>
                </div>
                
                <div class="content">
                    <p>Hola <strong>${ticket.customerName}</strong>,</p>
                    <p>¡Estamos emocionados de verte en el evento! Tu compra ha sido confirmada exitosamente.</p>

                    <div class="ticket-info">
                        <h2 style="margin-top: 0; color: #ff003c;">📋 Detalles del Evento</h2>
                        <div class="info-row">
                            <span class="info-label">Evento:</span>
                            <span class="info-value">${eventName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${eventDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ubicación:</span>
                            <span class="info-value">${eventLocation}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Cantidad:</span>
                            <span class="info-value">${ticket.purchaseQuantity} entrada(s)</span>
                        </div>
                        <div class="info-row" style="border-bottom: none;">
                            <span class="info-label">Total Pagado:</span>
                            <span class="info-value"><strong>${ticket.totalAmount.toFixed(2)} ${ticket.currency}</strong></span>
                        </div>
                    </div>

                    <div class="qr-section">
                        <h3 style="margin-top: 0;">🎫 ${ticket.purchaseQuantity > 1 ? 'Tus Entradas' : 'Tu Entrada'}</h3>
                        <p>${ticket.purchaseQuantity > 1 
                            ? `Hemos generado <strong>${ticket.purchaseQuantity} entradas individuales</strong> con códigos QR únicos.` 
                            : 'Hemos generado tu entrada con un código QR único.'}</p>
                        <p style="margin: 15px 0;">
                            <strong>📎 Descarga el PDF adjunto</strong> - Contiene ${ticket.purchaseQuantity > 1 ? 'todas tus entradas' : 'tu entrada'} con ${ticket.purchaseQuantity > 1 ? 'sus' : 'su'} código${ticket.purchaseQuantity > 1 ? 's' : ''} QR.
                        </p>
                        ${ticket.purchaseQuantity > 1 ? `
                        <p style="font-size: 14px; color: #666; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                            💡 <strong>Importante:</strong> Cada persona necesita su propia entrada. El PDF contiene ${ticket.purchaseQuantity} páginas, una por cada entrada.
                        </p>
                        ` : ''}
                    </div>

                    <div class="important-note">
                        <strong>⚠️ Importante:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>Cada código QR es único y solo puede ser usado una vez</li>
                            <li>Llega con antelación al evento para validar ${ticket.purchaseQuantity > 1 ? 'tus entradas' : 'tu entrada'}</li>
                            <li>No compartas ${ticket.purchaseQuantity > 1 ? 'estos códigos' : 'este código'} con nadie</li>
                            ${ticket.purchaseQuantity > 1 ? '<li>Puedes imprimir las entradas o mostrarlas desde tu móvil</li>' : ''}
                        </ul>
                    </div>

                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p><strong>¡Nos vemos en el evento!</strong></p>
                </div>

                <div class="footer">
                    <p><strong>Other People Records</strong></p>
                    <p>Este es un email automático con tu confirmación de compra.</p>
                    <p style="font-size: 12px; margin-top: 10px;">
                        ${ticket.purchaseQuantity > 1 ? `Entradas: ${ticket.purchaseQuantity}` : `Ticket: ${ticket.ticketCode}`}<br>
                        Fecha de compra: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('es-ES') : new Date().toLocaleString('es-ES')}
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateTicketEmailText(ticket, eventName, event) {
        const eventDate = event && event.date ? new Date(event.date).toLocaleDateString('es-ES') : 'Fecha por confirmar';
        const eventLocation = event && event.location ? event.location : 'Ubicación por confirmar';

        return `
¡GRACIAS POR TU COMPRA!
========================

Hola ${ticket.customerName},

Tu compra para ${eventName} ha sido confirmada.

DETALLES DEL EVENTO:
- Evento: ${eventName}
- Fecha: ${eventDate}
- Ubicación: ${eventLocation}
- Cantidad: ${ticket.purchaseQuantity} entrada(s)
- Total pagado: ${ticket.totalAmount.toFixed(2)} ${ticket.currency}

${ticket.purchaseQuantity > 1 ? 'TUS ENTRADAS' : 'TU ENTRADA'}:
${ticket.purchaseQuantity > 1 
    ? `Hemos generado ${ticket.purchaseQuantity} entradas individuales con códigos QR únicos.`
    : 'Hemos generado tu entrada con un código QR único.'}

📎 DESCARGA EL PDF ADJUNTO - Contiene ${ticket.purchaseQuantity > 1 ? 'todas tus entradas' : 'tu entrada'}.

${ticket.purchaseQuantity > 1 
    ? `IMPORTANTE: Cada persona necesita su propia entrada. El PDF contiene ${ticket.purchaseQuantity} páginas.`
    : ''}

⚠️ IMPORTANTE:
- Cada código QR es único y solo puede ser usado una vez
- Llega con antelación para validar ${ticket.purchaseQuantity > 1 ? 'tus entradas' : 'tu entrada'}
- No compartas ${ticket.purchaseQuantity > 1 ? 'estos códigos' : 'este código'} con nadie
${ticket.purchaseQuantity > 1 ? '- Puedes imprimir las entradas o mostrarlas desde tu móvil' : ''}

¡Nos vemos en el evento!

---
Other People Records
${ticket.purchaseQuantity > 1 ? `Entradas: ${ticket.purchaseQuantity}` : `Ticket: ${ticket.ticketCode}`}
Fecha de compra: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('es-ES') : new Date().toLocaleString('es-ES')}
        `.trim();
    }

    /**
     * Send Newsletter Email
     */
    async sendNewsletter(newsletter) {
        try {
            console.log('📧 [sendNewsletter] Starting newsletter send process...');
            console.log('📧 [sendNewsletter] Newsletter:', newsletter?.title, 'ID:', newsletter?._id);
            
            if (!this.transporter) {
                console.warn('⚠️ [sendNewsletter] Email service not initialized. Skipping newsletter send.');
                return; 
            }

            // In a real scenario, you'd fetch all subscribers here.
            // For now, we mock valid subscribers or send to a test list/admin.
            console.log('📧 [sendNewsletter] Fetching active subscribers...');
            const NewsletterSubscription = require('../models/NewsletterSubscription');
            const subscribers = await NewsletterSubscription.find({ status: 'active' });
            console.log(`📧 [sendNewsletter] Found ${subscribers.length} active subscribers`);
            
            if (subscribers.length === 0) {
                console.log('0️⃣ [sendNewsletter] No active subscribers found.');
                return;
            }
            
            console.log(`📨 [sendNewsletter] Preparing to send newsletter "${newsletter.title}" to ${subscribers.length} subscribers...`);

            // Send in batches or loop (Nodemailer is not a bulk sender service, be careful with limits)
            // For MVP/Demo: loop
            // Ideally use a dedicated service like SendGrid/Resend API directly, but user asked for Nodemailer.
            
            const results = { success: 0, failed: 0 };
            
            // Limit to first 5 for safety during testing if massive list, or all if small.
            // Assuming small list for now.
            for (const sub of subscribers) {
                 try {
                     console.log(`📧 [sendNewsletter] Generating email for: ${sub.email}`);
                     // Generate personalized HTML for each subscriber with their unsubscribe token
                     let emailHtml;
                     if (NewsletterEmail) {
                         console.log(`📧 [sendNewsletter] Using React template for: ${sub.email}`);
                         emailHtml = await render(
                             React.createElement(NewsletterEmail, { 
                                 newsletter,
                                 subscriberEmail: sub.email,
                                 unsubscribeToken: sub.confirmationToken || sub._id.toString()
                             })
                         );
                     } else {
                         console.log(`📧 [sendNewsletter] Using fallback template for: ${sub.email}`);
                         emailHtml = this.generateNewsletterFallbackTemplate(newsletter, sub.email, sub.confirmationToken || sub._id.toString());
                     }
                     
                     console.log(`📧 [sendNewsletter] Sending email to: ${sub.email}`);
                     await this.transporter.sendMail({
                         from: {
                             name: process.env.EMAIL_FROM_NAME || 'Other People Records',
                             address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER
                         },
                         to: sub.email,
                         subject: newsletter.title,
                         html: emailHtml,
                     });
                     console.log(`✅ [sendNewsletter] Email sent successfully to: ${sub.email}`);
                     results.success++;
                 } catch (err) {
                     console.error(`❌ [sendNewsletter] Failed to send to ${sub.email}:`, err.message);
                     console.error(`❌ [sendNewsletter] Error stack:`, err.stack);
                     results.failed++;
                 }
            }
            
            console.log(`✅ [sendNewsletter] Newsletter sent. Success: ${results.success}, Failed: ${results.failed}`);
            return results;

        } catch (error) {
             console.error('❌ [sendNewsletter] Error sending newsletter batch:', error);
             console.error('❌ [sendNewsletter] Error message:', error.message);
             console.error('❌ [sendNewsletter] Error stack:', error.stack);
             throw error;
        }
    }

    /**
     * Send Beat Delivery Email with download links
     */
    async sendBeatDeliveryEmail({ to, customerName, beatTitle, licenseName, formats, files, licenseTerms, licensePdf = null, licenseNumber = null }) {
        try {
            if (!this.transporter) {
                throw new Error('Email service not initialized. Please check Gmail configuration.');
            }

            console.log('🎵 Sending beat delivery email to:', to);
            console.log('   Beat:', beatTitle);
            console.log('   License:', licenseName);
            console.log('   Formats:', formats.join(', '));
            if (licensePdf) {
                console.log('   📄 License PDF will be attached');
            }

            // Generate HTML using React Email template
            let emailHtml;
            if (BeatPurchaseEmail) {
                emailHtml = await render(
                    React.createElement(BeatPurchaseEmail, {
                        customerName,
                        beatTitle,
                        licenseName,
                        formats,
                        files,
                        licenseTerms,
                        licenseNumber
                    })
                );
            } else {
                emailHtml = this.generateBeatDeliveryTemplate(customerName, beatTitle, licenseName, formats, files, licenseTerms, licenseNumber);
            }

            const emailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'OTP Records',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER
                },
                to: to,
                subject: `Tu compra: ${beatTitle} - ${licenseName}`,
                html: emailHtml,
                text: this.generateBeatDeliveryText(customerName, beatTitle, licenseName, formats, files, licenseTerms)
            };

            // Add PDF attachment if provided
            if (licensePdf) {
                emailOptions.attachments = [{
                    filename: `Licencia-${licenseNumber || 'Beat'}.pdf`,
                    content: licensePdf,
                    contentType: 'application/pdf'
                }];
                console.log('   ✅ PDF attachment added to email');
            }

            const result = await this.transporter.sendMail(emailOptions);
            
            console.log('✅ Beat delivery email sent successfully');
            
            return {
                success: true,
                result: result
            };

        } catch (error) {
            console.error('❌ Error sending beat delivery email:', error.message);
            throw new Error(`Failed to send beat delivery email: ${error.message}`);
        }
    }

    generateBeatDeliveryTemplate(customerName, beatTitle, licenseName, formats, files, licenseTerms, licenseNumber = null) {
        // Format license terms for display
        const formatTerm = (value) => {
            if (value === 'unlimited' || value === 0 || value === '0') {
                return 'Ilimitado';
            }
            return value;
        };

        const licenseSection = licenseNumber ? `
            <div style="background-color: #0e0e0e; border: 1px solid #ff003c; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="color: #ff003c; font-weight: bold; margin: 0;">📄 Licencia Incluida</p>
                <p style="color: #fff; margin: 5px 0;">Número: ${licenseNumber}</p>
                <p style="color: #999; font-size: 12px; margin: 5px 0;">Tu licencia está adjunta a este email en formato PDF</p>
            </div>
        ` : '';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Tu compra de beat - OTP Records</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background-color: #0a0a0a; 
                    color: #ffffff; 
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px; 
                    margin: 0 auto; 
                    background-color: #1a1a1a; 
                    border-radius: 12px; 
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                }
                .header {
                    background: linear-gradient(135deg, #ff003c 0%, #cc0030 100%);
                    padding: 40px 20px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 40px;
                }
                .beat-details {
                    background-color: #0e0e0e;
                    border: 1px solid #333;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }
                .beat-details h2 {
                    color: #ff003c;
                    margin-top: 0;
                    font-size: 22px;
                }
                .detail-row {
                    margin: 10px 0;
                    padding: 8px 0;
                    border-bottom: 1px solid #333;
                }
                .detail-label {
                    color: #999;
                    font-size: 14px;
                }
                .detail-value {
                    color: #fff;
                    font-weight: bold;
                    margin-top: 4px;
                }
                .download-section {
                    margin: 30px 0;
                }
                .download-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #ff003c 0%, #cc0030 100%);
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 8px;
                    margin: 8px 0;
                    font-weight: bold;
                }
                .download-button:hover {
                    background: linear-gradient(135deg, #cc0030 0%, #ff003c 100%);
                }
                .license-terms {
                    background-color: #0e0e0e;
                    border-left: 4px solid #ff003c;
                    padding: 20px;
                    margin: 20px 0;
                }
                .license-terms h3 {
                    color: #ffffff;
                    margin-top: 0;
                }
                .license-terms ul {
                    color: #cccccc;
                    line-height: 1.8;
                    padding-left: 20px;
                }
                .license-terms li {
                    margin: 8px 0;
                }
                .expiry-note {
                    background-color: #2a1a00;
                    border: 1px solid #ff8800;
                    color: #ffcc00;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    font-size: 14px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    background-color: #0e0e0e;
                    color: #888;
                    font-size: 12px;
                }
                .footer img {
                    max-width: 150px;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Gracias por tu compra!</h1>
                </div>
                
                <div class="content">
                    <p>Hola <strong>${customerName}</strong>,</p>
                    
                    <p>Tu compra se ha completado exitosamente. Aquí están los detalles:</p>
                    
                    ${licenseSection}
                    
                    <div class="beat-details">
                        <h2>${beatTitle}</h2>
                        <div class="detail-row">
                            <div class="detail-label">Licencia adquirida</div>
                            <div class="detail-value">${licenseName}</div>
                        </div>
                        <div class="detail-row" style="border-bottom: none;">
                            <div class="detail-label">Formatos incluidos</div>
                            <div class="detail-value">${formats.join(', ')}</div>
                        </div>
                    </div>
                    
                    <div class="download-section">
                        <h3 style="color: #ffffff;">Descargar tus archivos:</h3>
                        <p style="color: #cccccc; font-size: 14px; margin-bottom: 20px;">
                            Haz clic en los botones de abajo para descargar tu beat en los formatos incluidos en tu licencia.
                        </p>
                        ${formats.map(format => {
                            let url = '';
                            if (format === 'MP3' && files.mp3Url) url = files.mp3Url;
                            if (format === 'WAV' && files.wavUrl) url = files.wavUrl;
                            if (format === 'STEMS' && files.stemsUrl) url = files.stemsUrl;
                            
                            return url ? `
                                <a href="${url}" class="download-button" style="display: block; margin: 10px 0;">
                                    📥 Descargar ${format}
                                </a>
                            ` : '';
                        }).join('')}
                    </div>
                    
                    <div class="expiry-note">
                        ⏰ <strong>Importante:</strong> Descarga tus archivos pronto. Si tienes problemas con la descarga, 
                        contáctanos dentro de las próximas 48 horas.
                    </div>
                    
                    ${licenseTerms ? `
                    <div class="license-terms">
                        <h3>Términos de Uso de tu Licencia:</h3>
                        <ul>
                            ${licenseTerms.usedForRecording ? '<li>✅ Permitido para grabación musical</li>' : ''}
                            <li>📀 Distribuir hasta <strong>${formatTerm(licenseTerms.distributionLimit)}</strong> copias</li>
                            <li>🎧 <strong>${formatTerm(licenseTerms.audioStreams)}</strong> reproducciones online</li>
                            <li>🎬 <strong>${formatTerm(licenseTerms.musicVideos)}</strong> vídeos musicales</li>
                            ${licenseTerms.forProfitPerformances ? '<li>✅ Actuaciones con ánimo de lucro permitidas</li>' : '<li>❌ Actuaciones con ánimo de lucro no permitidas</li>'}
                            <li>📻 Emisión en <strong>${formatTerm(licenseTerms.radioBroadcasting)}</strong> emisoras de radio</li>
                        </ul>
                    </div>
                    ` : ''}
                    
                    <p style="color: #cccccc; margin-top: 30px;">
                        Si tienes alguna pregunta o necesitas reenvío de los archivos, contáctanos en 
                        <strong>support@otp-records.com</strong>
                    </p>
                    
                    <p style="color: #cccccc;">
                        <strong>¡Disfruta creando música increíble!</strong>
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>OTP Records</strong></p>
                    <p>© ${new Date().getFullYear()} OTP Records. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    generateBeatDeliveryText(customerName, beatTitle, licenseName, formats, files, licenseTerms) {
        const formatTerm = (value) => {
            if (value === 'unlimited' || value === 0 || value === '0') {
                return 'Ilimitado';
            }
            return value;
        };

        // Generate download links text
        let downloadLinks = '';
        formats.forEach(format => {
            let url = '';
            if (format === 'MP3' && files.mp3Url) url = files.mp3Url;
            if (format === 'WAV' && files.wavUrl) url = files.wavUrl;
            if (format === 'STEMS' && files.stemsUrl) url = files.stemsUrl;
            
            if (url) {
                downloadLinks += `\n📥 Descargar ${format}: ${url}`;
            }
        });

        let termsText = '';
        if (licenseTerms) {
            termsText = `
TÉRMINOS DE USO DE TU LICENCIA:
${licenseTerms.usedForRecording ? '✅ Permitido para grabación musical' : ''}
📀 Distribuir hasta ${formatTerm(licenseTerms.distributionLimit)} copias
🎧 ${formatTerm(licenseTerms.audioStreams)} reproducciones online
🎬 ${formatTerm(licenseTerms.musicVideos)} vídeos musicales
${licenseTerms.forProfitPerformances ? '✅ Actuaciones con ánimo de lucro permitidas' : '❌ Actuaciones con ánimo de lucro no permitidas'}
📻 Emisión en ${formatTerm(licenseTerms.radioBroadcasting)} emisoras de radio
`;
        }

        return `
¡GRACIAS POR TU COMPRA!
========================

Hola ${customerName},

Tu compra se ha completado exitosamente. Aquí están los detalles:

BEAT: ${beatTitle}
LICENCIA: ${licenseName}
FORMATOS: ${formats.join(', ')}

DESCARGAR TUS ARCHIVOS:${downloadLinks}

⏰ IMPORTANTE: Descarga tus archivos pronto. Si tienes problemas, contáctanos dentro de las próximas 48 horas.

${termsText}

Si tienes alguna pregunta, contáctanos en support@otp-records.com

¡Disfruta creando música increíble!

---
OTP Records
© ${new Date().getFullYear()} OTP Records. Todos los derechos reservados.
        `.trim();
    }

    generateNewsletterFallbackTemplate(newsletter, subscriberEmail, unsubscribeToken) {
        const { title, content } = newsletter;
        const { uniqueBeats = [], upcomingReleases = [], events = [], discounts = [] } = content || {};
        const unsubscribeUrl = `https://www.otherpeople.es/unsubscribe?email=${encodeURIComponent(subscriberEmail)}&token=${unsubscribeToken}`;

        let releasesHtml = '';
        if (upcomingReleases.length > 0) {
            releasesHtml = '<h2 style="color: #ff003c; border-bottom: 1px solid #333; padding-bottom: 8px;">Últimos lanzamientos</h2>';
            upcomingReleases.forEach(song => {
                releasesHtml += `
                <div style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 16px; padding: 12px; border: 1px solid #333; display: flex; gap: 12px;">
                    <img src="${song.img || 'https://via.placeholder.com/100'}" width="100" height="100" style="border-radius: 4px; object-fit: cover;" />
                    <div>
                        <h3 style="margin: 0; font-size: 18px;">${song.title}</h3>
                        <p style="color: #ccc; margin: 4px 0;">${song.subtitle || 'New Single'}</p>
                        <a href="${song.spotifyLink || '#'}" style="background-color: #1DB954; color: white; padding: 10px 12px; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 8px;">Listen on Spotify</a>
                    </div>
                </div>`;
            });
        }

        let eventsHtml = '';
        if (events.length > 0) {
            eventsHtml = '<h2 style="color: #ff003c; border-bottom: 1px solid #333; padding-bottom: 8px; margin-top: 24px;">Próximos eventos</h2>';
            events.forEach(event => {
                eventsHtml += `
                <div style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 16px; padding: 12px; border: 1px solid #333; display: flex; gap: 12px;">
                    <img src="${event.img || 'https://via.placeholder.com/100'}" width="100" height="100" style="border-radius: 4px; object-fit: cover;" />
                    <div>
                        <h3 style="margin: 0; font-size: 20px;">${event.name}</h3>
                        <p style="color: #ddd; margin: 8px 0;">📍 ${event.location} | 🕒 ${new Date(event.date).toLocaleDateString()}</p>
                        <a href="https://www.otherpeople.es/eventos/${event._id}" style="background-color: #ff003c; color: white; padding: 10px 12px; border-radius: 4px; text-decoration: none; display: inline-block;">Comprar Entradas</a>
                    </div>
                </div>`;
            });
        }

        let beatsHtml = '';
        if (uniqueBeats.length > 0) {
            beatsHtml = '<h2 style="color: #ff003c; border-bottom: 1px solid #333; padding-bottom: 8px; margin-top: 24px;">Beats Exclusivos</h2>';
            uniqueBeats.forEach(beat => {
                beatsHtml += `
                <div style="background-color: #1a1a1a; border-radius: 8px; margin-bottom: 16px; padding: 12px; border: 1px solid #333; display: flex; gap: 12px;">
                    <img src="${beat.coverUrl || 'https://via.placeholder.com/100'}" width="100" height="100" style="border-radius: 4px; object-fit: cover;" />
                    <div>
                        <h3 style="margin: 0; font-size: 18px;">${beat.title}</h3>
                        <p style="color: #ccc; margin: 4px 0;">${beat.key} • ${beat.bpm} BPM</p>
                        <a href="https://www.otherpeople.es/beats/${beat._id}" style="background-color: #ff003c; color: white; padding: 10px 12px; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 8px;">${beat.price === 0 ? 'Descargar' : `${beat.price}€`}</a>
                    </div>
                </div>`;
            });
        }

        let discountsHtml = '';
        if (discounts.length > 0) {
            discounts.forEach(discount => {
                discountsHtml += `
                <div style="text-align: center; margin: 32px 0; border: 1px dashed #ff003c; padding: 20px; border-radius: 8px;">
                    <h3 style="font-size: 24px; color: #fff;">🎁 Descuento exclusivo</h3>
                    <p style="color: #ccc;">Usa el código abajo al pagar:</p>
                    <p style="font-size: 32px; font-weight: bold; color: #ff003c; margin: 16px 0;">${discount.code}</p>
                    <p style="color: #888;">${discount.description}</p>
                </div>`;
            });
        }

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
        </head>
        <body style="background-color: #000000; font-family: Arial, sans-serif; color: #ffffff; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; background-color: #111; padding: 24px;">
                    <img src="https://www.otherpeople.es/img/OTPNewsletter.png" width="200" alt="Other People Records" style="max-width: 50%; height: auto;" />
                    <h1 style="font-size: 28px; margin: 16px 0 0;">${title}</h1>
                </div>
                
                <div style="padding: 20px 0;">
                    ${releasesHtml}
                    ${eventsHtml}
                    ${beatsHtml}
                    ${discountsHtml}
                </div>
                
                <hr style="border-color: #333; margin: 32px 0;" />
                
                <div style="text-align: center;">
                    <p style="font-size: 14px; color: #666;">© ${new Date().getFullYear()} Other People Records. All rights reserved.</p>
                    <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = EmailService;
