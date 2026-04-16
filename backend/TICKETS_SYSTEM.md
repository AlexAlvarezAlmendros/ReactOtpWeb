# Sistema de Venta de Entradas con Stripe

## 📋 Descripción

Sistema completo de venta de entradas para eventos integrado con Stripe Checkout. Permite a los usuarios comprar tickets para eventos, recibir confirmaciones por email con códigos QR, y validar entradas en los eventos.

---

## 🚀 Funcionalidades Implementadas

### Backend

✅ **Modelos de Datos**
- Modelo `Event` actualizado con campos de tickets (precio, cantidad, disponibilidad)
- Modelo `Ticket` para gestión de entradas compradas

✅ **API Endpoints**
- `POST /api/tickets/create-checkout-session` - Crear sesión de pago con Stripe
- `POST /api/tickets/webhook` - Webhook para recibir confirmaciones de Stripe
- `GET /api/tickets/verify/:ticketCode` - Verificar validez de un ticket
- `POST /api/tickets/validate/:ticketCode` - Marcar ticket como usado (admin)
- `GET /api/tickets/my-tickets` - Obtener tickets del usuario autenticado
- `GET /api/tickets/event/:eventId/sales` - Estadísticas de ventas (admin)

✅ **Servicios**
- Integración completa con Stripe API
- Generación de códigos QR para tickets
- Envío de emails con confirmación y código QR adjunto
- Validación de inventario de tickets

---

## ⚙️ Configuración

### 1. Variables de Entorno

Añade las siguientes variables a tu archivo `.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (ya deberías tenerlas configuradas)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
EMAIL_FROM_NAME=Other People Records
```

### 2. Configuración de Stripe

#### Paso 1: Crear cuenta en Stripe
1. Ve a [https://stripe.com](https://stripe.com) y crea una cuenta
2. Activa el modo de prueba (test mode) para desarrollo

#### Paso 2: Obtener las claves API
1. Ve a **Developers → API keys**
2. Copia la **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`
3. Copia la **Publishable key** (`pk_test_...`) → `STRIPE_PUBLISHABLE_KEY`

#### Paso 3: Configurar el Webhook
1. Ve a **Developers → Webhooks**
2. Click en **Add endpoint**
3. URL del endpoint: `https://tu-dominio.com/api/tickets/webhook`
   - Para desarrollo local, necesitas usar [Stripe CLI](https://stripe.com/docs/stripe-cli) o [ngrok](https://ngrok.com)
4. Selecciona el evento a escuchar: `checkout.session.completed`
5. Copia el **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

#### Desarrollo Local con Stripe CLI
```bash
# Instalar Stripe CLI
# Windows (con Scoop): scoop install stripe
# O descargar desde: https://github.com/stripe/stripe-cli/releases

# Iniciar sesión
stripe login

# Reenviar webhooks a tu servidor local
stripe listen --forward-to localhost:5001/api/tickets/webhook

# El CLI te dará un webhook secret temporal (whsec_...)
# Úsalo en tu .env como STRIPE_WEBHOOK_SECRET
```

---

## 📝 Uso del Sistema

### Crear un Evento con Tickets

Cuando creas o actualizas un evento, añade los siguientes campos:

```json
{
  "name": "Concierto de Rock",
  "location": "Madrid, España",
  "date": "2025-12-31T20:00:00Z",
  "img": "https://...",
  "eventType": "Concert",
  "userId": "admin-user-id",
  
  // Configuración de tickets
  "ticketsEnabled": true,
  "ticketPrice": 15.00,
  "totalTickets": 100,
  "availableTickets": 100,
  "ticketsSold": 0,
  "ticketCurrency": "EUR",
  "saleStartDate": "2025-01-15T00:00:00Z",
  "saleEndDate": "2025-12-31T19:00:00Z"
}
```

### Flujo de Compra

1. **Usuario selecciona evento** → Ve la información de tickets disponibles
2. **Click "Comprar Entradas"** → Formulario con cantidad, nombre, email
3. **Procesar pago** → Redirige a Stripe Checkout
4. **Usuario paga** → Stripe procesa el pago
5. **Webhook confirma** → Backend crea ticket y actualiza inventario
6. **Email enviado** → Usuario recibe confirmación con QR
7. **Redirigir** → Usuario vuelve a la página del evento

### Verificar un Ticket

```bash
GET /api/tickets/verify/TICKET-1234567890-ABC123

# Respuesta:
{
  "valid": true,
  "alreadyUsed": false,
  "ticket": {
    "code": "TICKET-1234567890-ABC123",
    "customerName": "Juan Pérez",
    "quantity": 2,
    "eventName": "Concierto de Rock",
    "eventDate": "2025-12-31T20:00:00Z"
  }
}
```

### Validar un Ticket (Marcar como usado)

```bash
POST /api/tickets/validate/TICKET-1234567890-ABC123
Authorization: Bearer <admin-token>

# Respuesta:
{
  "success": true,
  "message": "Ticket validado correctamente",
  "ticket": {
    "code": "TICKET-1234567890-ABC123",
    "customerName": "Juan Pérez",
    "quantity": 2,
    "validatedAt": "2025-12-31T19:45:00Z"
  }
}
```

---

## 🧪 Testing

### Testing con Tarjetas de Prueba de Stripe

Usa estas tarjetas en modo test:

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0025 0000 3155`

Fecha de expiración: Cualquier fecha futura  
CVV: Cualquier 3 dígitos  
Código postal: Cualquier código

### Probar el Webhook Localmente

```bash
# Terminal 1: Servidor backend
npm start

# Terminal 2: Stripe CLI
stripe listen --forward-to localhost:5001/api/tickets/webhook

# Terminal 3: Trigger un evento de prueba
stripe trigger checkout.session.completed
```

---

## 📊 Estructura de la Base de Datos

### Event (actualizado)
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  date: Date,
  // ... otros campos existentes ...
  
  // Nuevos campos de tickets
  ticketsEnabled: Boolean,
  ticketPrice: Number,
  totalTickets: Number,
  availableTickets: Number,
  ticketsSold: Number,
  ticketCurrency: String,
  saleStartDate: Date,
  saleEndDate: Date
}
```

### Ticket (nuevo)
```javascript
{
  _id: ObjectId,
  eventId: ObjectId (ref: Event),
  purchaseId: String,           // Stripe session ID
  customerEmail: String,
  customerName: String,
  quantity: Number,
  totalAmount: Number,
  currency: String,
  status: String,               // pending, completed, cancelled, refunded
  ticketCode: String,           // Código único del ticket
  qrCode: String,               // QR en base64
  validated: Boolean,
  validatedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Seguridad

✅ **Implementado:**
- Validación de firma de webhooks con `STRIPE_WEBHOOK_SECRET`
- Verificación de disponibilidad de tickets antes de crear sesión
- Validación de fechas de venta
- Códigos de ticket únicos y no predecibles
- Autenticación requerida para endpoints de validación (admin)

⚠️ **Recomendaciones adicionales:**
- Implementar rate limiting en endpoints públicos
- Añadir logs detallados de todas las transacciones
- Monitorear intentos de validación múltiple del mismo ticket
- Implementar sistema de reembolsos

---

## 📧 Emails

El sistema envía emails automáticos con:
- Confirmación de compra
- Código de ticket único
- Código QR (adjunto como imagen y en el cuerpo del email)
- Detalles del evento
- Instrucciones de uso

**Nota:** Asegúrate de tener configuradas correctamente las credenciales de Gmail (GMAIL_USER y GMAIL_APP_PASSWORD).

---

## 🎯 Próximos Pasos (Fase 2)

- [ ] Sistema de escaneo QR para validación en evento
- [ ] Dashboard de ventas en tiempo real para admin
- [ ] Exportar lista de asistentes a CSV/Excel
- [ ] Sistema de reembolsos
- [ ] Tickets con precios variables (Early Bird, VIP)
- [ ] Límite de compra por usuario
- [ ] Códigos promocionales y descuentos

---

## 🐛 Troubleshooting

### Error: "Webhook signature verification failed"
- Verifica que `STRIPE_WEBHOOK_SECRET` esté correcto
- Asegúrate de que el webhook en Stripe esté apuntando a la URL correcta
- En desarrollo, usa Stripe CLI para reenviar webhooks localmente

### No se envían los emails
- Verifica las credenciales de Gmail (`GMAIL_USER` y `GMAIL_APP_PASSWORD`)
- Revisa los logs del servidor para ver errores específicos
- Asegúrate de que Gmail permita "aplicaciones menos seguras" o usa una App Password

### Tickets no se actualizan después del pago
- Revisa que el webhook esté recibiendo eventos de Stripe
- Verifica los logs del servidor en `/api/tickets/webhook`
- Comprueba que la conexión a MongoDB esté activa

### Error: "Event not found" al crear checkout
- Verifica que el `eventId` sea correcto
- Asegúrate de que el evento tenga `ticketsEnabled: true`
- Comprueba que haya tickets disponibles

---

## 📞 Soporte

Para más información sobre la integración de Stripe:
- [Documentación de Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Webhooks de Stripe](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

**✨ Sistema de Tickets implementado exitosamente - ¡Listo para vender entradas!**
