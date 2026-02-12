# CardioTrack Backend

Sistema de monitoreo cardíaco IoT con ESP32, sensor AD8232, y sincronización con Ubidots.

## 🚀 Características

- ✅ Autenticación tradicional con verificación por email
- ✅ Login con Google OAuth 2.0
- ✅ JWT con access y refresh tokens
- ✅ Gestión de pacientes
- ✅ Registro de mediciones cardíacas (BPM, ECG)
- ✅ Validación estricta de datos médicos
- ✅ Sistema offline-first con sincronización automática a Ubidots
- ✅ Rate limiting y seguridad robusta
- ✅ Logs estructurados

## 📋 Requisitos

- Node.js >= 16
- PostgreSQL >= 13
- Cuenta de Gmail para envío de emails (o SMTP alternativo)
- Google Cloud Console (para OAuth)
- Cuenta de Ubidots (para sincronización en la nube)

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar PostgreSQL

Crear base de datos:

```bash
psql -U postgres
CREATE DATABASE cardiotrack_db;
\q
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardiotrack_db
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=genera_un_secret_seguro_aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail

# Ubidots
UBIDOTS_TOKEN=tu_token_de_ubidots
```

### 4. Configurar Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto nuevo
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar `http://localhost:3000` a orígenes autorizados
6. Copiar Client ID y Client Secret al `.env`

### 5. Configurar Gmail App Password

1. Ir a [Google Account Security](https://myaccount.google.com/security)
2. Habilitar verificación en 2 pasos
3. Generar "App Password"
4. Copiar password al `.env`

## 🚀 Ejecutar

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📡 API Endpoints

### Autenticación

```
POST /api/v1/auth/register        - Registrar usuario
POST /api/v1/auth/verify          - Verificar código email
POST /api/v1/auth/login           - Login tradicional
POST /api/v1/auth/google          - Login con Google
POST /api/v1/auth/refresh         - Renovar access token
POST /api/v1/auth/logout          - Cerrar sesión
```

### Pacientes (requiere autenticación)

```
POST   /api/v1/patients           - Crear paciente
GET    /api/v1/patients           - Listar pacientes
GET    /api/v1/patients/:id       - Obtener paciente
PUT    /api/v1/patients/:id       - Actualizar paciente
DELETE /api/v1/patients/:id       - Eliminar paciente
```

### Mediciones

```
POST /api/v1/measurements                    - Crear medición (ESP32)
GET  /api/v1/measurements/:patientId         - Historial mediciones
GET  /api/v1/measurements/:patientId/latest  - Última medición
GET  /api/v1/measurements/:patientId/stats   - Estadísticas
```

### Sincronización (requiere autenticación)

```
POST /api/v1/sync/trigger                    - Forzar sincronización
GET  /api/v1/sync/status                     - Estado de sincronización
POST /api/v1/sync/force/:measurementId       - Forzar sync específico (admin)
```

### Health Check

```
GET /api/health                              - Estado del servidor
```

## 🔐 Seguridad

- Helmet para headers HTTP seguros
- CORS configurado
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Bcrypt con 12 rounds
- JWT con expiración corta (15min access, 7 días refresh)
- Validación estricta de inputs
- Sanitización contra inyección
- Logs de seguridad

## 🗄️ Base de Datos

### Modelos

- **users**: Usuarios del sistema
- **verification_codes**: Códigos de verificación email
- **patients**: Pacientes monitoreados
- **heart_measurements**: Mediciones cardíacas
- **sessions**: Sesiones de refresh tokens
- **sync_status**: Estado de sincronización con Ubidots

## 📊 Sincronización Automática

El sistema ejecuta un cron job cada 5 minutos para sincronizar mediciones pendientes con Ubidots.

Configuración en `.env`:

```env
SYNC_CRON_SCHEDULE=*/5 * * * *  # Cada 5 minutos
SYNC_MAX_RETRIES=3              # Máximo 3 reintentos
```

## 🧪 Validaciones Médicas

### BPM
- Rango: 30-220 (fisiológicamente válido)
- Tipo: Integer

### Timestamp
- No puede ser futuro
- Formato: ISO 8601

### ECG Signal
- Tipo: Array de números
- No puede estar vacío

## 📝 Logs

Los logs se guardan en:

```
logs/
├── combined.log      # Todos los logs
├── error.log         # Solo errores
├── exceptions.log    # Excepciones no capturadas
└── rejections.log    # Promesas rechazadas
```

## 🔧 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuraciones
│   ├── models/          # Modelos Sequelize
│   ├── validators/      # Validadores express-validator
│   ├── middlewares/     # Middlewares
│   ├── services/        # Lógica de negocio
│   ├── controllers/     # Controladores
│   ├── routes/          # Rutas API
│   ├── utils/           # Utilidades
│   └── app.js           # Aplicación Express
├── logs/                # Archivos de log
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables
├── package.json         # Dependencias
└── server.js            # Punto de entrada
```

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
brew services list  # macOS
sudo service postgresql status  # Linux

# Reiniciar PostgreSQL
brew services restart postgresql  # macOS
sudo service postgresql restart  # Linux
```

### Error de email

Verificar que:
1. Verificación en 2 pasos esté habilitada
2. App Password esté generado correctamente
3. EMAIL_USER y EMAIL_PASSWORD estén en `.env`

### Error de Google OAuth

Verificar que:
1. Credenciales OAuth estén creadas
2. Orígenes autorizados incluyan tu URL
3. GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET estén en `.env`

## 📄 Licencia

MIT
