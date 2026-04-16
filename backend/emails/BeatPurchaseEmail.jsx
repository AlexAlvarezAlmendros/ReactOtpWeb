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

export const BeatPurchaseEmail = ({
  customerName = '',
  beatTitle = '',
  licenseName = '',
  formats = [],
  files = {},
  licenseTerms = {},
  licenseNumber = null
}) => {
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
    padding: '32px 24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #ff003c 0%, #cc0030 100%)',
  };

  const contentStyle = {
    padding: '0 24px',
  };

  const beatDetailsBoxStyle = {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  };

  const detailRowStyle = {
    margin: '12px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
  };

  const labelStyle = {
    color: '#999',
    fontSize: '14px',
    marginBottom: '4px',
  };

  const valueStyle = {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
  };

  const downloadSectionStyle = {
    margin: '30px 0',
    padding: '20px',
    backgroundColor: '#111',
    borderRadius: '8px',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #ff003c 0%, #cc0030 100%)',
    color: '#ffffff',
    padding: '14px 28px',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    display: 'inline-block',
    margin: '10px 0',
  };

  const warningBoxStyle = {
    backgroundColor: '#2a1a00',
    border: '1px solid #ff8800',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0',
  };

  const termsBoxStyle = {
    backgroundColor: '#111',
    borderLeft: '4px solid #ff003c',
    padding: '20px',
    margin: '20px 0',
  };

  const footerStyle = {
    textAlign: 'center',
    padding: '24px',
    backgroundColor: '#111',
    color: '#888',
    fontSize: '12px',
    marginTop: '32px',
  };

  const formatTerm = (value) => {
    if (value === 0 || value === '0' || value === 'unlimited') {
      return 'Ilimitado';
    }
    return value;
  };

  return (
    <Html>
      <Head />
      <Preview>Tu compra: {beatTitle} - {licenseName}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              margin: '0',
              color: '#ffffff'
            }}>
              🎉 ¡Gracias por tu compra!
            </Text>
            <Text style={{ 
              fontSize: '16px', 
              margin: '10px 0 0',
              color: '#ffffff'
            }}>
              Tu compra se ha completado exitosamente
            </Text>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            <Text style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '24px' }}>
              Hola <strong>{customerName}</strong>,
            </Text>
            
            <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Tu compra se ha completado exitosamente. Aquí están los detalles:
            </Text>

            {/* License Notice */}
            {licenseNumber && (
              <div style={{
                backgroundColor: '#0e0e0e',
                border: '2px solid #ff003c',
                borderRadius: '8px',
                padding: '20px',
                margin: '20px 0',
                textAlign: 'center'
              }}>
                <Text style={{
                  color: '#ff003c',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: '0 0 8px'
                }}>
                  📄 Licencia Incluida
                </Text>
                <Text style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  margin: '8px 0'
                }}>
                  Número: {licenseNumber}
                </Text>
                <Text style={{
                  color: '#999999',
                  fontSize: '14px',
                  margin: '8px 0 0',
                  lineHeight: '1.5'
                }}>
                  Tu licencia oficial está adjunta a este email en formato PDF. 
                  Guárdala en un lugar seguro como prueba de tu compra.
                </Text>
              </div>
            )}

            {/* Beat Details */}
            <div style={beatDetailsBoxStyle}>
              <Text style={{ 
                color: '#ff003c', 
                fontSize: '22px', 
                fontWeight: 'bold',
                margin: '0 0 16px'
              }}>
                {beatTitle}
              </Text>
              
              <div style={detailRowStyle}>
                <div style={labelStyle}>Licencia adquirida</div>
                <div style={valueStyle}>{licenseName}</div>
              </div>
              
              <div style={{ ...detailRowStyle, borderBottom: 'none' }}>
                <div style={labelStyle}>Formatos incluidos</div>
                <div style={valueStyle}>{formats.join(', ')}</div>
              </div>
            </div>

            {/* Download Section */}
            <div style={downloadSectionStyle}>
              <Text style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                color: '#ffffff',
                margin: '0 0 12px'
              }}>
                📥 Descargar tus archivos
              </Text>
              
              <Text style={{ 
                color: '#cccccc', 
                fontSize: '14px',
                margin: '0 0 20px',
                lineHeight: '1.6'
              }}>
                Haz clic en los botones de abajo para descargar tu beat en los formatos incluidos en tu licencia.
              </Text>

              {formats.map((format, index) => {
                let url = '';
                if (format === 'MP3' && files.mp3Url) url = files.mp3Url;
                if (format === 'WAV' && files.wavUrl) url = files.wavUrl;
                if (format === 'STEMS' && files.stemsUrl) url = files.stemsUrl;
                
                return url ? (
                  <div key={index} style={{ margin: '10px 0' }}>
                    <Button href={url} style={buttonStyle}>
                      📥 Descargar {format}
                    </Button>
                  </div>
                ) : null;
              })}
            </div>

            {/* Warning */}
            <div style={warningBoxStyle}>
              <Text style={{ 
                color: '#ffcc00', 
                fontSize: '14px',
                margin: 0,
                lineHeight: '1.6'
              }}>
                ⏰ <strong>Importante:</strong> Descarga tus archivos pronto. Si tienes problemas con la descarga, contáctanos dentro de las próximas 48 horas.
              </Text>
            </div>

            {/* License Terms */}
            {licenseTerms && (
              <div style={termsBoxStyle}>
                <Text style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: '0 0 16px'
                }}>
                  Términos de Uso de tu Licencia
                </Text>
                
                <ul style={{ 
                  color: '#cccccc', 
                  lineHeight: '1.8',
                  paddingLeft: '20px',
                  margin: 0
                }}>
                  {licenseTerms.usedForRecording && (
                    <li style={{ margin: '8px 0' }}>✅ Permitido para grabación musical</li>
                  )}
                  <li style={{ margin: '8px 0' }}>
                    📀 Distribuir hasta <strong>{formatTerm(licenseTerms.distributionLimit)}</strong> copias
                  </li>
                  <li style={{ margin: '8px 0' }}>
                    🎧 <strong>{formatTerm(licenseTerms.audioStreams)}</strong> reproducciones online
                  </li>
                  <li style={{ margin: '8px 0' }}>
                    🎬 <strong>{formatTerm(licenseTerms.musicVideos)}</strong> vídeos musicales
                  </li>
                  <li style={{ margin: '8px 0' }}>
                    {licenseTerms.forProfitPerformances 
                      ? '✅ Actuaciones con ánimo de lucro permitidas'
                      : '❌ Actuaciones con ánimo de lucro no permitidas'
                    }
                  </li>
                  <li style={{ margin: '8px 0' }}>
                    📻 Emisión en <strong>{formatTerm(licenseTerms.radioBroadcasting)}</strong> emisoras de radio
                  </li>
                </ul>
              </div>
            )}

            <Text style={{ 
              color: '#cccccc', 
              fontSize: '14px',
              marginTop: '32px',
              lineHeight: '1.6'
            }}>
              Si tienes alguna pregunta o necesitas reenvío de los archivos, contáctanos en{' '}
              <Link href="mailto:justsomeotherpeople@gmail.com" style={{ color: '#ff003c' }}>
                justsomeotherpeople@gmail.com
              </Link>
            </Text>

            <Text style={{ 
              color: '#ffffff', 
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '20px'
            }}>
              ¡Disfruta creando música increíble! 🎵
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={{ margin: '0 0 10px', fontWeight: 'bold', fontSize: '14px' }}>
              OTHER PEOPLE RECORDS
            </Text>
            <Text style={{ margin: '0', fontSize: '12px', color: '#666' }}>
              © {new Date().getFullYear()} Other People Records. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BeatPurchaseEmail;
