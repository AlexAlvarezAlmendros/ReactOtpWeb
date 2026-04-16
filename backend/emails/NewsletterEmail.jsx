import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

export const NewsletterEmail = ({
  newsletter = {},
  subscriberEmail = '',
  unsubscribeToken = '',
}) => {
  const { title, content } = newsletter;
  const { uniqueBeats = [], upcomingReleases = [], events = [], discounts = [] } = content || {};
  
  // Generar URL de desuscripción con token y email
  const unsubscribeUrl = `https://www.otherpeople.es/unsubscribe?email=${encodeURIComponent(subscriberEmail)}&token=${unsubscribeToken}`;

  const mainStyle = {
    backgroundColor: '#000000',
    fontFamily: 'HelveticaNeue, Helvetica, Arial, sans-serif',
    color: '#ffffff',
  };

  const containerStyle = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '600px',
  };

  const headerStyle = {
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#111',
  };

  const sectionTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '24px 0 12px',
    color: '#ff003c', // Brand color from ticket service
    borderBottom: '1px solid #333',
    paddingBottom: '8px',
  };

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '16px',
    border: '1px solid #333',
  };

  const buttonStyle = {
    backgroundColor: '#ff003c',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    padding: '12px',
    marginTop: '12px',
  };

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            {/* Replace with actual logo URL */}
            <Img
              src="https://www.otherpeople.es/img/OTPNewsletter.png"
              width="50"
              height="50"
              alt="Other People Records Logo"
              style={{ margin: '0 auto', display: 'block', width: '50%', height: 'auto' }}
            />
            <Text style={{ fontSize: '28px', fontWeight: 'bold', margin: '16px 0 0' }}>{title}</Text>
          </Section>

          {/* Releases / Songs Section */}
          {upcomingReleases.length > 0 && (
            <Section>
              <Text style={sectionTitleStyle}>Últimos lanzamientos</Text>
              {upcomingReleases.map((song) => (
                <Row key={song._id} style={cardStyle}>
                  <Column style={{ width: '100px', padding: '12px' }}>
                    <Img
                      src={song.img || 'https://via.placeholder.com/100'}
                      width="100"
                      height="100"
                      style={{ borderRadius: '4px', objectFit: 'cover' }}
                    />
                  </Column>
                  <Column style={{ padding: '12px' }}>
                    <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>{song.title}</Text>
                    <Text style={{ fontSize: '14px', color: '#ccc', margin: '4px 0' }}>
                      {song.subtitle || 'New Single'}
                    </Text>
                    <Button pX={10} pY={5} href={song.spotifyLink || '#'} style={{...buttonStyle, backgroundColor: '#1DB954'}}>
                      Listen on Spotify
                    </Button>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* Events Section */}
          {events.length > 0 && (
            <Section>
              <Text style={sectionTitleStyle}>Próximos eventos</Text>
              {events.map((event) => (
                <Row key={event._id} style={cardStyle}>
                  <Column style={{ width: '100px', padding: '12px' }}>
                    <Img
                      src={event.img || 'https://via.placeholder.com/100'}
                      width="100"
                      height="100"
                      style={{ borderRadius: '4px', objectFit: 'cover' }}
                    />
                  </Column>
                  <Column style={{ padding: '16px' }}>
                    <Text style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>{event.name}</Text>
                    <Text style={{ fontSize: '16px', color: '#ddd', margin: '8px 0' }}>
                      📍 {event.location} | 🕒 {new Date(event.date).toLocaleDateString()}
                    </Text>
                    <Button pX={10} pY={5} href={`https://www.otherpeople.es/eventos/${event._id}`} style={buttonStyle}>
                      Comprar Entradas
                    </Button>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* Beats Section */}
          {uniqueBeats.length > 0 && (
            <Section>
              <Text style={sectionTitleStyle}>Beats Exclusivos</Text>
              {uniqueBeats.map((beat) => (
                <Row key={beat._id} style={cardStyle}>
                  <Column style={{ width: '100px', padding: '12px' }}>
                    <Img
                      src={beat.coverUrl || 'https://via.placeholder.com/100'}
                      width="100"
                      height="100"
                      style={{ borderRadius: '4px', objectFit: 'cover' }}
                    />
                  </Column>
                  <Column style={{ padding: '12px' }}>
                    <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>{beat.title}</Text>
                    <Text style={{ fontSize: '14px', color: '#ccc', margin: '4px 0' }}>
                      {beat.key} • {beat.bpm} BPM
                    </Text>
                    <Button pX={10} pY={5} href={`https://www.otherpeople.es/beats/${beat._id}`} style={buttonStyle}>
                      <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cart-shopping" class="svg-inline--fa fa-cart-shopping " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path></svg> {beat.price === 0 ? 'Descargar' : `${beat.price}€`}
                    </Button>
                  </Column>
                </Row>
              ))}
            </Section>
          )}

          {/* Discounts */}
          {discounts.length > 0 && (
            <Section>
              {discounts.map((discount) => (
                <Section key={discount._id} style={{ textAlign: 'center', margin: '32px 0', border: '1px dashed #ff003c', padding: '20px', borderRadius: '8px' }}>
                  <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>🎁 Descuento exclusivo</Text>
                  <Text style={{ fontSize: '16px', color: '#ccc' }}>Usa el código abajo al pagar:</Text>
                  <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff003c', margin: '16px 0' }}>
                    {discount.code}
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#888' }}>{discount.description}</Text>
                </Section>
              ))}
            </Section>
          )}

          <Hr style={{ borderColor: '#333', margin: '32px 0' }} />

          {/* Footer */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#666' }}>
              © {new Date().getFullYear()} Other People Records. Todos los derechos reservados.
            </Text>
            <Link href={unsubscribeUrl} style={{ color: '#666', textDecoration: 'underline' }}>
              Unsubscribe
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;
