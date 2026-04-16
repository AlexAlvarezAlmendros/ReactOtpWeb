# Test de Generación de Licencias

Creado un sistema completo de tests para generar licencias PDF con datos de ejemplo.

## 📁 Archivos Creados

- `tests/test-license-generation.js` - Test principal que genera una licencia completa
- `tests/cleanup-test-data.js` - Script para limpiar datos de prueba
- `output/` - Directorio donde se guardan los PDFs generados

## 🚀 Uso

### Generar una Licencia de Prueba

```bash
npm run test:license
```

Esto:
1. ✅ Crea un beat de prueba
2. ✅ Crea un purchase asociado
3. ✅ Emite una licencia oficial
4. ✅ Genera un PDF profesional
5. ✅ Guarda el PDF en `output/Licencia-LILBRU-YYYY-NNNNNN.pdf`

### Limpiar Datos de Prueba

Después de revisar el PDF, limpia los datos:

```bash
node tests/cleanup-test-data.js <beatId>
```

El `beatId` se muestra al final del test.

## ✅ Test Completado Exitosamente

**Resultado**: 
- ✅ PDF generado: `output/Licencia-LILBRU-2026-000001.pdf`
- ✅ Tamaño: ~7.35 KB
- ✅ Licencia emitida: `LILBRU-2026-000001`
- ✅ Tier: Premium
- ✅ Todos los términos incluidos

## 📋 Datos de Ejemplo Utilizados

**Beat**:
- Título: Dark Trap Beat
- BPM: 140
- Key: Am
- Genre: Trap

**Comprador**:
- Nombre: Juan Pérez García
- Email: juan.perez@example.com

**Licencia**:
- Tier: Premium
- Precio: 99.99 EUR
- Streams: 500,000
- Videos: 1 monetizado
- Copias físicas: 10,000

## 📄 Contenido del PDF

El PDF incluye:
1. Número de licencia único
2. Detalles del beat (título, BPM, key)
3. Información del productor y comprador
4. 8 secciones legales completas
5. Limitaciones específicas del tier
6. Publishing split (50/50)
7. QR code para verificación
8. Hash SHA-256 del documento

## 🔍 Verificación

Puedes verificar la licencia con:

```bash
curl http://localhost:5001/api/licenses/verify/LILBRU-2026-000001
```

O escanea el QR code del PDF.

## 🎯 Próximos Pasos

1. ✅ Abre el PDF generado en `output/`
2. ✅ Revisa el diseño y contenido
3. ✅ Verifica el QR code
4. ✅ Prueba el endpoint de verificación
5. ✅ Limpia los datos de prueba cuando termines

## 🧪 Modificar el Test

Puedes editar `tests/test-license-generation.js` para cambiar:
- Datos del beat (título, BPM, key)
- Datos del comprador
- Tier de la licencia (Basic/Premium/Unlimited)
- Precio y moneda

## 📝 Notas

- Los PDFs se guardan en `output/` (ignorado por git)
- Los datos de prueba quedan en la BD hasta que los limpies
- Puedes ejecutar el test múltiples veces
- Cada ejecución genera un nuevo número de licencia secuencial
