# CardioTrack Frontend

Frontend para el sistema de monitoreo cardíaco CardioTrack con ESP32 y sensor AD8232.

## 📁 Estructura del Proyecto

```
frontend/
├── index.html              # Landing page
├── login.html              # Página de inicio de sesión
├── register.html           # Página de registro
├── verify.html             # Verificación de email
├── dashboard.html          # Dashboard principal (BPM en tiempo real)
├── statistics.html         # Historial y estadísticas
├── profile.html            # Perfil de usuario
├── js/
│   ├── api.js             # Cliente API (conecta con backend)
│   ├── utils.js           # Funciones utilitarias
│   ├── auth.js            # Lógica de autenticación
│   ├── dashboard.js       # Lógica del dashboard
│   ├── statistics.js      # Lógica de estadísticas
│   └── profile.js         # Lógica del perfil
└── README.md              # Este archivo
```

## 🚀 Configuración

### 1. Configurar URL del Backend

Editar `js/api.js` y cambiar la URL del backend si es necesario:

```javascript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

### 2. Servir el Frontend

El frontend es estático (HTML/CSS/JS), puedes servirlo con:

#### Opción 1: Live Server (VS Code)
1. Instalar extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"

#### Opción 2: Python HTTP Server
```bash
cd frontend
python3 -m http.server 5173
```

#### Opción 3: Node.js http-server
```bash
npm install -g http-server
cd frontend
http-server -p 5173
```

El frontend estará disponible en `http://localhost:5173`

## 🔐 Flujo de Autenticación

### Registro Tradicional
1. Usuario completa formulario en `/register.html`
2. Backend envía código de 6 dígitos por email
3. Usuario ingresa código en `/verify.html`
4. Redirección automática a `/dashboard.html`

### Login Tradicional
1. Usuario ingresa email/contraseña en `/login.html`
2. Backend valida credenciales
3. Almacena tokens JWT en localStorage
4. Redirección a `/dashboard.html`

### Login con Google OAuth
1. Usuario hace click en "Continuar con Google"
2. Popup de Google OAuth
3. Backend valida token de Google
4. Almacena tokens JWT
5. Redirección a `/dashboard.html`

## 📊 Dashboard

El dashboard muestra:
- **BPM en tiempo real** (actualización automática cada 5 segundos)
- **Historial reciente** de mediciones
- **Estado de conexión** con el dispositivo ESP32
- **Navegación** a estadísticas y perfil

## 🔧 Archivos JavaScript

### `api.js`
Cliente API completo con:
- Autenticación (register, login, verify, Google OAuth)
- Gestión de pacientes
- Obtención de mediciones
- Refresh automático de tokens
- Manejo de errores

### `utils.js`
Funciones utilitarias:
- `showToast()` - Notificaciones
- `showLoading()` / `hideLoading()` - Estados de carga
- `validatePassword()` - Validación de contraseñas
- `isAuthenticated()` - Verificar autenticación
- `formatDate()` - Formateo de fechas
- `getBPMStatus()` - Estado del BPM (normal, taquicardia, bradicardia)

### `auth.js`
Lógica de autenticación:
- Manejo de formularios login/register
- Integración con Google OAuth
- Almacenamiento de tokens
- Redirecciones

### `dashboard.js`
Lógica del dashboard:
- Obtener última medición BPM
- Actualización en tiempo real (polling cada 5s)
- Mostrar historial reciente
- Gestión de pacientes

### `statistics.js`
Lógica de estadísticas:
- Gráficas de tendencias
- Filtros por fecha
- Estadísticas agregadas (promedio, mínimo, máximo)

### `profile.js`
Lógica del perfil:
- Mostrar información del usuario
- Editar perfil
- Cerrar sesión

## 🎨 Diseño

El frontend usa:
- **Tailwind CSS** (CDN) para estilos
- **Material Symbols** para iconos
- **Inter** como fuente principal
- **Tema rojo médico** (#e11d48)
- **Modo oscuro** soportado
- **Responsive** para móvil y desktop

## 📱 Responsive Design

Todas las páginas son completamente responsive:
- **Mobile**: Diseño vertical, menú colapsable
- **Tablet**: Diseño adaptativo
- **Desktop**: Diseño completo con sidebar

## 🔒 Seguridad

- Tokens JWT almacenados en `localStorage`
- Refresh automático de access tokens
- Validación de formularios en cliente y servidor
- Sanitización de inputs
- HTTPS recomendado en producción

## 🧪 Testing

Para probar el frontend:

1. **Iniciar backend**:
```bash
cd backend
npm run dev
```

2. **Iniciar frontend**:
```bash
cd frontend
python3 -m http.server 5173
```

3. **Abrir navegador**:
```
http://localhost:5173
```

4. **Flujo de prueba**:
   - Registrarse con email válido
   - Verificar código (revisar consola del backend para el código)
   - Iniciar sesión
   - Ver dashboard
   - Revisar estadísticas
   - Editar perfil
   - Cerrar sesión

## 🌐 Google OAuth Setup

Para habilitar login con Google:

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar `http://localhost:5173` a orígenes autorizados
6. Copiar Client ID
7. Agregar script de Google en HTML:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

8. Configurar botón de Google:

```javascript
google.accounts.id.initialize({
    client_id: 'TU_GOOGLE_CLIENT_ID',
    callback: handleGoogleLogin
});
```

## 📝 Notas Importantes

### Actualización en Tiempo Real
El dashboard usa **polling** cada 5 segundos para obtener la última medición BPM. Para una solución más eficiente en producción, considera usar **WebSockets**.

### Almacenamiento de Tokens
Los tokens se almacenan en `localStorage`. Para mayor seguridad en producción, considera usar cookies `httpOnly`.

### CORS
Asegúrate de que el backend tenga configurado CORS para permitir requests desde `http://localhost:5173`.

### Producción
Para producción:
1. Cambiar `API_BASE_URL` a tu dominio
2. Usar HTTPS
3. Minificar JavaScript
4. Optimizar imágenes
5. Configurar CDN

## 🐛 Troubleshooting

### Error de CORS
Verificar que el backend tenga:
```javascript
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
```

### Tokens no se guardan
Verificar que el navegador permita `localStorage`

### Google OAuth no funciona
Verificar que:
- Client ID esté correcto
- Origen esté autorizado en Google Console
- Script de Google esté cargado

## 📄 Licencia

MIT
