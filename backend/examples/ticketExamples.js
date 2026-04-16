/**
 * Script de ejemplo para probar el sistema de tickets
 * 
 * Este script muestra cómo interactuar con los endpoints de tickets
 */

// Ejemplo 1: Crear una sesión de checkout
async function createCheckoutSession() {
  const response = await fetch('http://localhost:5001/api/tickets/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventId: '507f1f77bcf86cd799439011', // ID del evento
      quantity: 2,
      customerEmail: 'usuario@ejemplo.com',
      customerName: 'Juan Pérez'
    })
  });

  const data = await response.json();
  console.log('Checkout Session:', data);
  // data.url -> Redirigir al usuario a esta URL para pagar
  
  return data;
}

// Ejemplo 2: Verificar un ticket
async function verifyTicket(ticketCode) {
  const response = await fetch(`http://localhost:5001/api/tickets/verify/${ticketCode}`);
  const data = await response.json();
  
  console.log('Ticket Verification:', data);
  return data;
}

// Ejemplo 3: Validar un ticket (requiere token de admin)
async function validateTicket(ticketCode, adminToken) {
  const response = await fetch(`http://localhost:5001/api/tickets/validate/${ticketCode}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  console.log('Ticket Validation:', data);
  return data;
}

// Ejemplo 4: Obtener mis tickets (requiere autenticación)
async function getMyTickets(userToken) {
  const response = await fetch('http://localhost:5001/api/tickets/my-tickets', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });

  const data = await response.json();
  console.log('My Tickets:', data);
  return data;
}

// Ejemplo 5: Obtener estadísticas de ventas de un evento (admin)
async function getEventSales(eventId, adminToken) {
  const response = await fetch(`http://localhost:5001/api/tickets/event/${eventId}/sales`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const data = await response.json();
  console.log('Event Sales:', data);
  return data;
}

// Ejemplo 6: Crear un evento con tickets habilitados
async function createEventWithTickets(adminToken) {
  const response = await fetch('http://localhost:5001/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Concierto de Rock',
      location: 'Madrid, España',
      date: '2025-12-31T20:00:00Z',
      img: 'https://example.com/image.jpg',
      eventType: 'Concert',
      userId: 'admin-user-id',
      
      // Configuración de tickets
      ticketsEnabled: true,
      ticketPrice: 15.00,
      totalTickets: 100,
      availableTickets: 100,
      ticketsSold: 0,
      ticketCurrency: 'EUR',
      saleStartDate: '2025-01-15T00:00:00Z',
      saleEndDate: '2025-12-31T19:00:00Z'
    })
  });

  const data = await response.json();
  console.log('Event Created:', data);
  return data;
}

// Ejemplo 7: Actualizar un evento para habilitar tickets
async function enableTicketsForEvent(eventId, adminToken) {
  const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      ticketsEnabled: true,
      ticketPrice: 20.00,
      totalTickets: 150,
      availableTickets: 150,
      saleStartDate: new Date().toISOString(),
      saleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    })
  });

  const data = await response.json();
  console.log('Event Updated:', data);
  return data;
}

module.exports = {
  createCheckoutSession,
  verifyTicket,
  validateTicket,
  getMyTickets,
  getEventSales,
  createEventWithTickets,
  enableTicketsForEvent
};
