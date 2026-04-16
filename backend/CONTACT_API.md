# Contact API Endpoint

## Configuración

### 1. Variables de Entorno
Agrega estas variables a tu archivo `.env`:

```env
# Email Configuration (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM_NAME=OTP Records
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### 2. Configurar Gmail App Password
1. Ve a tu cuenta de Google
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `GMAIL_APP_PASSWORD`

## Endpoints

### POST /api/contact
Envía un mensaje de contacto.

**Acceso:** Público (con rate limiting)  
**Rate Limit:** 5 mensajes por hora por IP

#### Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Consulta sobre servicios",
  "message": "Hola, me gustaría saber más información..."
}
```

#### Respuesta exitosa (200):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "id": "64f5a1b2c3d4e5f6a7b8c9d0",
  "emailInfo": {
    "adminSent": true,
    "userConfirmationSent": true
  }
}
```

#### Errores:
- `400` - Campos faltantes o datos inválidos
- `429` - Rate limit excedido
- `500` - Error interno del servidor

### GET /api/contact/health
Verifica el estado del servicio de email.

**Acceso:** Público

#### Respuesta:
```json
{
  "service": "email",
  "status": "healthy",
  "message": "Email service is ready",
  "timestamp": "2025-07-23T10:30:00.000Z"
}
```

### GET /api/contact/messages
Obtiene todos los mensajes de contacto (solo admin).

**Acceso:** Admin únicamente  
**Auth:** JWT requerido con permisos `admin:all`

#### Query Parameters:
- `page` - Número de página (default: 1)
- `limit` - Elementos por página (default: 20)
- `status` - Filtrar por estado: `pending`, `sent`, `failed`
- `search` - Buscar en nombre, email o asunto

#### Respuesta:
```json
{
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Consulta",
      "message": "Mensaje...",
      "status": "sent",
      "sentAt": "2025-07-23T10:30:00.000Z",
      "createdAt": "2025-07-23T10:29:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### GET /api/contact/messages/:id
Obtiene un mensaje específico (solo admin).

**Acceso:** Admin únicamente

### DELETE /api/contact/messages/:id
Elimina un mensaje de contacto (solo admin).

**Acceso:** Admin únicamente

## Funcionalidades

### 📧 Envío de Emails
- **Al Admin:** Recibe el mensaje completo del usuario
- **Al Usuario:** Confirmación de que el mensaje fue recibido
- **Templates HTML:** Emails con formato profesional
- **Fallback texto:** Versión en texto plano

### 🛡️ Seguridad
- **Rate Limiting:** Máximo 5 mensajes por hora por IP
- **Validación:** Campos requeridos y validación de email
- **Sanitización:** Limpieza de datos de entrada
- **Logging:** Registro de actividad para auditoría

### 📊 Base de Datos
- **Almacenamiento:** Todos los mensajes se guardan en MongoDB
- **Estados:** `pending`, `sent`, `failed`
- **Metadatos:** IP, User Agent, timestamps
- **Búsqueda:** Indexado para consultas eficientes

### 🔍 Monitoreo
- **Health Check:** Verificación del servicio de email
- **Logs detallados:** Para debugging y monitoreo
- **Status tracking:** Estado de cada mensaje

## Uso desde Frontend

### JavaScript Vanilla
```javascript
async function sendContactMessage(formData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      alert('Mensaje enviado exitosamente!');
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    alert('Error de conexión');
  }
}
```

### React
```jsx
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('¡Mensaje enviado!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};
```

## Testing

Ejecuta el archivo de prueba:
```bash
node test-contact-api.js
```

Las pruebas verifican:
- ✅ Health check del servicio
- ✅ Envío de mensajes válidos
- ✅ Validación de campos
- ✅ Rate limiting

## Troubleshooting

### Error: "Authentication failed"
- Verifica que `GMAIL_USER` y `GMAIL_APP_PASSWORD` están correctos
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal

### Error: "Service unavailable"
- Verifica la conexión a internet
- Comprueba que Gmail no esté bloqueando la aplicación

### Rate limit excedido
- Espera 1 hora antes de enviar más mensajes desde la misma IP
- Para desarrollo, puedes reiniciar el servidor para limpiar el cache
