const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * Genera un UUID v4 compatible
 * Alternativa a uuid para evitar problemas con ESM en Vercel
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Genera un código de ticket legible (TKT-XXXX-XXXX)
 */
function generateTicketCode() {
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TKT-${part1}-${part2}`;
}

/**
 * Genera un código QR en base64
 * @param {string} validationCode - UUID de validación
 * @param {string} frontendUrl - URL del frontend
 * @returns {Promise<string>} - QR en base64
 */
async function generateQRCode(validationCode, frontendUrl = process.env.FRONTEND_URL) {
  try {
    // Siempre usar la URL de producción para los QR codes
    // Esto permite que los tickets funcionen incluso si se generan en desarrollo
    const baseUrl = 'https://www.otherpeople.es';
    
    const url = `${baseUrl}/ticket/${validationCode}`;
    console.log('🔗 Generating QR for URL:', url);
    
    const qrBase64 = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrBase64;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Genera un PDF del ticket
 * @param {Object} ticket - Objeto del ticket
 * @param {Object} event - Objeto del evento
 * @returns {Promise<Buffer>} - Buffer del PDF
 */
async function generateTicketPDF(ticket, event) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Ticket - ${event.name}`,
          Author: 'OTHER PEOPLE RECORDS'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header - Logo y título
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('OTHER PEOPLE RECORDS', 50, 50, { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Entrada ${ticket.ticketNumber} de ${ticket.purchaseQuantity}`, { align: 'center' });

      // Línea separadora
      doc.moveTo(50, 120)
         .lineTo(545, 120)
         .strokeColor('#CCCCCC')
         .stroke();

      // Información del evento
      doc.moveDown(3);
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(event.name, 50, 150, { align: 'center' });

      doc.moveDown(1);
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#333333');

      const eventDate = new Date(event.date);
      const dateStr = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = eventDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.text(`📅 Fecha: ${dateStr}`, 50, 220);
      doc.text(`🕐 Hora: ${timeStr}`, 50, 245);
      doc.text(`📍 Lugar: ${event.location}`, 50, 270);

      // QR Code
      if (ticket.qrCode) {
        // Convertir base64 a buffer
        const qrBuffer = Buffer.from(ticket.qrCode.split(',')[1], 'base64');
        doc.image(qrBuffer, 200, 320, { 
          width: 200,
          align: 'center'
        });
      }

      // Código del ticket
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(`Código: ${ticket.ticketCode}`, 50, 540, { align: 'center' });

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`ID: ${ticket.validationCode}`, 50, 565, { align: 'center' });

      // Línea separadora
      doc.moveTo(50, 600)
         .lineTo(545, 600)
         .strokeColor('#CCCCCC')
         .stroke();

      // Información del comprador
      doc.moveDown(2);
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Información de la compra', 50, 620);

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#333333');

      doc.text(`Nombre: ${ticket.customerName}`, 50, 645);
      doc.text(`Email: ${ticket.customerEmail}`, 50, 665);
      doc.text(`Entrada: ${ticket.ticketNumber} de ${ticket.purchaseQuantity}`, 50, 685);
      doc.text(`Total pagado: ${ticket.totalAmount.toFixed(2)} ${ticket.currency}`, 50, 705);

      // Términos y condiciones
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#999999')
         .text(
           'Este ticket es válido para una sola entrada al evento. No es reembolsable. ' +
           'Muestra este código QR en la entrada del evento para su validación. ' +
           'Conserva este ticket hasta después del evento. ' +
           'Cada entrada tiene un código QR único e intransferible.',
           50,
           740,
           {
             width: 495,
             align: 'justify'
           }
         );

      // Footer
      doc.fontSize(8)
         .fillColor('#CCCCCC')
         .text(
           '© OTHER PEOPLE RECORDS - Todos los derechos reservados',
           50,
           780,
           { align: 'center' }
         );

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
}

/**
 * Genera todos los datos necesarios para un ticket individual
 * @param {Object} event - Evento
 * @param {Object} purchaseData - Datos de la compra
 * @param {number} ticketNumber - Número de este ticket (1, 2, 3...)
 * @returns {Promise<Object>} - Datos del ticket completos
 */
async function generateTicketData(event, purchaseData, ticketNumber = 1) {
  try {
    const validationCode = generateUUID();
    const ticketCode = generateTicketCode();
    const qrCode = await generateQRCode(validationCode);

    const ticketData = {
      validationCode,
      ticketCode,
      qrCode,
      eventId: event._id,
      purchaseId: purchaseData.sessionId,
      customerEmail: purchaseData.customerEmail,
      customerName: purchaseData.customerName,
      purchaseQuantity: purchaseData.quantity,
      ticketNumber: ticketNumber,
      totalAmount: purchaseData.totalAmount,
      currency: purchaseData.currency || 'EUR',
      status: 'active',
      validated: false
    };

    return ticketData;
  } catch (error) {
    console.error('Error generating ticket data:', error);
    throw error;
  }
}

/**
 * Genera múltiples tickets individuales para una compra
 * @param {Object} event - Evento
 * @param {Object} purchaseData - Datos de la compra
 * @returns {Promise<Array>} - Array de tickets generados
 */
async function generateMultipleTickets(event, purchaseData) {
  try {
    const quantity = purchaseData.quantity;
    const tickets = [];

    console.log(`🎫 Generating ${quantity} individual tickets...`);

    for (let i = 1; i <= quantity; i++) {
      const ticketData = await generateTicketData(event, purchaseData, i);
      tickets.push(ticketData);
      console.log(`  ✅ Generated ticket ${i}/${quantity}: ${ticketData.ticketCode}`);
    }

    console.log(`🎉 Successfully generated ${tickets.length} tickets`);
    return tickets;
  } catch (error) {
    console.error('Error generating multiple tickets:', error);
    throw error;
  }
}

/**
 * Genera un PDF combinado con todas las entradas
 * @param {Array} tickets - Array de tickets
 * @param {Object} event - Objeto del evento
 * @returns {Promise<Buffer>} - Buffer del PDF combinado
 */
async function generateCombinedTicketsPDF(tickets, event) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Entradas - ${event.name}`,
          Author: 'OTHER PEOPLE RECORDS'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Generar una página por cada ticket
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        
        if (i > 0) {
          doc.addPage(); // Nueva página para cada ticket después del primero
        }

        // Header - Logo y título
        doc.fontSize(28)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('OTHER PEOPLE RECORDS', 50, 50, { align: 'center' });

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Entrada ${ticket.ticketNumber} de ${ticket.purchaseQuantity}`, { align: 'center' });

        // Línea separadora
        doc.moveTo(50, 120)
           .lineTo(545, 120)
           .strokeColor('#CCCCCC')
           .stroke();

        // Información del evento
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(event.name, 50, 150, { align: 'center' });

        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#333333');

        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const timeStr = eventDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });

        doc.text(`📅 Fecha: ${dateStr}`, 50, 220);
        doc.text(`🕐 Hora: ${timeStr}`, 50, 245);
        doc.text(`📍 Lugar: ${event.location}`, 50, 270);

        // QR Code
        if (ticket.qrCode) {
          const qrBuffer = Buffer.from(ticket.qrCode.split(',')[1], 'base64');
          doc.image(qrBuffer, 200, 320, { 
            width: 200,
            align: 'center'
          });
        }

        // Código del ticket
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(`Código: ${ticket.ticketCode}`, 50, 540, { align: 'center' });

        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`ID: ${ticket.validationCode}`, 50, 565, { align: 'center' });

        // Línea separadora
        doc.moveTo(50, 600)
           .lineTo(545, 600)
           .strokeColor('#CCCCCC')
           .stroke();

        // Información del comprador
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('Información de la compra', 50, 620);

        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#333333');

        doc.text(`Nombre: ${ticket.customerName}`, 50, 645);
        doc.text(`Email: ${ticket.customerEmail}`, 50, 665);
        doc.text(`Entrada: ${ticket.ticketNumber} de ${ticket.purchaseQuantity}`, 50, 685);
        doc.text(`Total pagado: ${ticket.totalAmount.toFixed(2)} ${ticket.currency}`, 50, 705);

        // Términos y condiciones
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#999999')
           .text(
             'Este ticket es válido para una sola entrada al evento. No es reembolsable. ' +
             'Muestra este código QR en la entrada del evento para su validación. ' +
             'Conserva este ticket hasta después del evento. ' +
             'Cada entrada tiene un código QR único e intransferible.',
             50,
             740,
             {
               width: 495,
               align: 'justify'
             }
           );

        // Footer
        doc.fontSize(8)
           .fillColor('#CCCCCC')
           .text(
             '© OTHER PEOPLE RECORDS - Todos los derechos reservados',
             50,
             780,
             { align: 'center' }
           );
      }

      doc.end();
    } catch (error) {
      console.error('Error generating combined PDF:', error);
      reject(error);
    }
  });
}

module.exports = {
  generateTicketCode,
  generateQRCode,
  generateTicketPDF,
  generateTicketData,
  generateMultipleTickets,
  generateCombinedTicketsPDF
};
