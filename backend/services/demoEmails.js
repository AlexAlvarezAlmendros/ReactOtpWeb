/**
 * Correos de /enviar-maqueta: aviso al equipo y respuesta automática al
 * artista. Reutiliza el transporter de EmailService (Gmail).
 */
const esc = (str) => String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const PANEL_URL = 'https://www.otherpeople.es/crear';

function adminEmail(demo) {
    const links = demo.links.map((l) => `<li><a href="${esc(l)}">${esc(l)}</a></li>`).join('');
    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
<h2 style="margin:0 0 12px">Nueva maqueta: ${esc(demo.artistName)}</h2>
<p><strong>Email:</strong> <a href="mailto:${esc(demo.email)}">${esc(demo.email)}</a><br>
${demo.realName ? `<strong>Nombre:</strong> ${esc(demo.realName)}<br>` : ''}
${demo.city ? `<strong>Ciudad:</strong> ${esc(demo.city)}<br>` : ''}
${demo.genres.length ? `<strong>Géneros:</strong> ${esc(demo.genres.join(', '))}<br>` : ''}
${demo.instagram ? `<strong>Instagram:</strong> ${esc(demo.instagram)}<br>` : ''}</p>
<p><strong>Música:</strong></p><ul>${links}</ul>
${demo.message ? `<p><strong>Mensaje:</strong><br>${esc(demo.message).replace(/\n/g, '<br>')}</p>` : ''}
<p><a href="${PANEL_URL}">Abrir el panel de maquetas</a></p>
</body></html>`;
    const text = [
        `Nueva maqueta: ${demo.artistName}`,
        `Email: ${demo.email}`,
        demo.city && `Ciudad: ${demo.city}`,
        demo.genres.length && `Géneros: ${demo.genres.join(', ')}`,
        'Música:',
        ...demo.links.map((l) => `- ${l}`),
        demo.message && `\nMensaje:\n${demo.message}`,
        `\nPanel: ${PANEL_URL}`
    ].filter(Boolean).join('\n');
    return { subject: `[MAQUETA] ${demo.artistName}${demo.city ? ` (${demo.city})` : ''}`, html, text };
}

function confirmationEmail(demo) {
    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:600px">
<h2 style="margin:0 0 12px">Hemos recibido tu maqueta</h2>
<p>Hola ${esc(demo.artistName)},</p>
<p>Gracias por mandarnos tu música. Esto es lo que pasa ahora:</p>
<ol>
<li><strong>La escuchamos.</strong> Todo lo que llega lo escucha alguien del equipo, no un algoritmo.</li>
<li><strong>Si encaja, te escribimos</strong> a este correo para conocerte y hablar del proyecto.</li>
<li><strong>Si no encaja ahora,</strong> no es un no para siempre: cuando tengas música nueva, vuelve a mandárnosla.</li>
</ol>
<p>Mientras tanto, puedes ver cómo trabajamos con los artistas en <a href="https://www.otherpeople.es/nuevos-talentos">nuevos talentos</a> y escuchar lo que hemos publicado en la <a href="https://www.otherpeople.es/discografia">discografía</a>.</p>
<p>— Other People Records</p>
<p style="color:#888;font-size:12px">Recibes este correo porque has enviado una maqueta en otherpeople.es. Tus datos solo se usan para valorar tu música (ver <a href="https://www.otherpeople.es/privacidad">privacidad</a>).</p>
</body></html>`;
    const text = `Hola ${demo.artistName},

Gracias por mandarnos tu música. Todo lo que llega lo escucha alguien del equipo. Si encaja, te escribimos a este correo; si no encaja ahora, vuelve a mandárnosla cuando tengas música nueva.

Nuevos talentos: https://www.otherpeople.es/nuevos-talentos
Discografía: https://www.otherpeople.es/discografia

— Other People Records`;
    return { subject: 'Hemos recibido tu maqueta — Other People Records', html, text };
}

/** Envía los dos correos. Devuelve { admin, user } con true/false. */
async function sendDemoEmails(emailService, demo) {
    if (!emailService?.transporter) throw new Error('Email service not initialized');
    const from = { name: process.env.EMAIL_FROM_NAME || 'OTP Records', address: process.env.EMAIL_FROM_ADDRESS || process.env.GMAIL_USER };
    const admin = adminEmail(demo);
    const user = confirmationEmail(demo);
    const [adminResult, userResult] = await Promise.allSettled([
        emailService.transporter.sendMail({ from, to: process.env.DEMO_INBOX || process.env.GMAIL_USER, replyTo: demo.email, ...admin }),
        emailService.transporter.sendMail({ from, to: demo.email, ...user })
    ]);
    return { admin: adminResult.status === 'fulfilled', user: userResult.status === 'fulfilled' };
}

module.exports = { sendDemoEmails, adminEmail, confirmationEmail };
