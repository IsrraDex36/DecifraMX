# DescífraMX 🔍🇲🇽

Una herramienta educativa de código abierto diseñada para analizar, validar y explicar visualmente la estructura de tu **CURP** (Clave Única de Registro de Población) y **RFC** (Registro Federal de Contribuyentes) para personas físicas.

DescífraMX desglosa cada componente de tu código (letras del nombre, fecha de nacimiento, sexo, estado, homoclave, etc.) y explica su significado de acuerdo con las reglas oficiales de la SEGOB y el SAT.

## ✨ Características Principales

- **Análisis Visual:** Desglosa cada segmento de tu CURP o RFC y te explica su significado detalladamente.
- **Validación de Estructura:** Detecta errores de formato y comprueba que la estructura cumpla con los estándares oficiales.
- **Privacidad Total (100% Local):** Todo el procesamiento ocurre en tu navegador mediante TypeScript/JavaScript. **No se envía tu información a ningún servidor.**
- **Soporte Offline (PWA):** DescífraMX es una Aplicación Web Progresiva. Puedes instalarla y usarla sin conexión a internet desde tu dispositivo.
- **Enfoque Educativo:** Aprende detalles técnicos como las letras reemplazadas por el SAT (palabras inconvenientes), la homoclave, etc.

> **Nota:** Esta herramienta valida la estructura y formato, pero **no** consulta bases de datos oficiales (como RENAPO o el SAT) para confirmar la existencia o estado actual del documento.

## 🛠️ Tecnologías Utilizadas

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **UI & Estilos:** [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com/)
- **Animaciones:** Framer Motion, tailwind-merge, clsx
- **PWA:** `@ducanh2912/next-pwa`
- **Lenguaje Base:** TypeScript, React 19

## 🚀 Instalación y Desarrollo Local

Para correr este proyecto en tu entorno local, sigue estos pasos:

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/ahitaclave.git
   cd ahitaclave
   ```

2. **Instala las dependencias:**
   Puedes usar `npm`, `yarn`, `pnpm` o `bun`.

   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

4. **Visualiza el proyecto:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en funcionamiento.

5. **Opcional — Ejecutar tests:**
   ```bash
   npm run test
   ```

## 📡 API REST

La aplicación expone una API pública para validar y decodificar CURP y RFC por HTTP. El procesamiento se hace en el servidor; no se consultan bases oficiales (RENAPO/SAT).

- **App en producción:** [https://deciframx.vercel.app](https://deciframx.vercel.app)
- **Especificación OpenAPI (JSON):** [https://deciframx.vercel.app/api/docs](https://deciframx.vercel.app/api/docs)

### Base URL

| Entorno | URL |
|--------|-----|
| Local | `http://localhost:3000` |
| Producción | `https://deciframx.vercel.app` |

### Límite de uso (Rate Limit)

- **100 peticiones por hora** por IP.
- Cabeceras en cada respuesta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Si se excede: HTTP `429` y cabecera `Retry-After` (segundos hasta el reinicio).

### Endpoints

#### Validar CURP (POST)

Valida y decodifica un CURP: estructura, longitud 18 caracteres y dígito verificador.

- **`POST /api/validate/curp`**
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  { "curp": "HEGJ850101HDFRLN08" }
  ```
- **Respuesta exitosa (200):**
  ```json
  {
    "valid": true,
    "curp": "HEGJ850101HDFRLN08",
    "verificador": {
      "esValido": true,
      "digitoEncontrado": 8,
      "digitoEsperado": 8,
      "mensaje": "✅ CURP matemáticamente auténtico."
    },
    "data": {
      "iniciales": "HEGJ",
      "nombre": "J",
      "primerApellido": "H",
      "segundoApellido": "G",
      "fechaNacimiento": "01/01/1985",
      "sexo": "Hombre",
      "estadoNacimiento": "Ciudad de México",
      "codigoEstado": "DF"
    },
    "errors": []
  }
  ```

#### Validar CURP (GET)

Mismo comportamiento que el POST, con el CURP en la ruta.

- **`GET /api/validate/curp/{curp}`**
- **Ejemplo:** `GET /api/validate/curp/HEGJ850101HDFRLN08`

#### Validar RFC (POST)

Valida y decodifica un RFC (12 o 13 caracteres).

- **`POST /api/validate/rfc`**
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  { "rfc": "HEGJ850101ABC" }
  ```
- **Respuesta exitosa (200):**
  ```json
  {
    "valid": true,
    "rfc": "HEGJ850101ABC",
    "tipo": "persona_fisica",
    "data": {
      "fechaNacimiento": "01/01/1985",
      "homoclave": "ABC",
      "tienePalabraInconveniente": false
    },
    "errors": []
  }
  ```

#### Catálogo de estados

Devuelve los códigos de entidad federativa usados en el CURP.

- **`GET /api/states`**
- **Respuesta (200):**
  ```json
  {
    "states": [
      { "codigo": "AS", "nombre": "Aguascalientes" },
      { "codigo": "DF", "nombre": "Ciudad de México" },
      ...
    ]
  }
  ```

#### Documentación OpenAPI

Especificación OpenAPI 3.0 en JSON.

- **`GET /api/docs`**

### Respuestas de error

Las respuestas de error tienen `valid: false` y un array `errors` con objetos `{ code, message, field? }`.

| Código | HTTP | Descripción |
|--------|------|-------------|
| `INVALID_FORMAT` | 400 / 415 | Body no JSON, Content-Type incorrecto o estructura inválida |
| `MISSING_FIELD` | 400 | Falta el campo `curp` o `rfc` en el body |
| `INVALID_LENGTH` | 400 | CURP ≠ 18 caracteres o RFC ≠ 12/13 |
| `INVALID_DATE` | 400 | Fecha de nacimiento inválida |
| `INVALID_STATE` | 400 | Código de estado no reconocido |
| `INVALID_GENDER` | 400 | Sexo no válido (debe ser H o M) |
| `RATE_LIMIT_EXCEEDED` | 429 | Se superó el límite de 100 peticiones/hora |

**Ejemplo de error (400):**
```json
{
  "valid": false,
  "curp": "ABC123",
  "errors": [
    { "code": "INVALID_LENGTH", "message": "El CURP debe tener exactamente 18 caracteres.", "field": "curp" }
  ]
}
```

### Probar la API (Postman / cURL)

**Producción (Vercel):** base URL `https://deciframx.vercel.app`

- **CURP (POST):** `POST https://deciframx.vercel.app/api/validate/curp` — Body raw JSON `{"curp": "HEGJ850101HDFRLN08"}`, header `Content-Type: application/json`.
- **CURP (GET):** `GET https://deciframx.vercel.app/api/validate/curp/HEGJ850101HDFRLN08`.
- **RFC (POST):** `POST https://deciframx.vercel.app/api/validate/rfc` — Body raw JSON `{"rfc": "HEGJ850101ABC"}`, header `Content-Type: application/json`.
- **Estados:** `GET https://deciframx.vercel.app/api/states`.
- **OpenAPI (especificación):** `GET https://deciframx.vercel.app/api/docs`.

## 🔒 Privacidad y Seguridad

La privacidad es el núcleo de este proyecto. Entendemos que el CURP y el RFC son datos sensibles. Por ello, la arquitectura de DescífraMX garantiza que:

- No existen bases de datos respaldando formularios con información sensible.
- No hay llamadas a APIs externas que procesen tus datos.
- Todo el código de validación, separación y extracción se ejecuta **únicamente en el cliente**.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Como este proyecto es público, si tienes ideas para mejorar la extracción de datos, optimizar la experiencia de usuario, o añadir más detalles educativos, siéntete libre de abrir un _Issue_ o enviar un _Pull Request_.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Eres libre de usar, modificar y distribuir el código para tus propios fines y herramientas.
