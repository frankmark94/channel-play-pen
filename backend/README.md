# DMS Client Channel Backend

Backend server for the Pega DMS Client Channel API Playground.

## Features

- **🔐 Dynamic Credentials**: No hardcoded DMS credentials - accepts them from frontend
- Express.js server with TypeScript
- Real-time WebSocket communication
- Integration with Pega DMS Client Channel
- Comprehensive error handling and logging
- RESTful API endpoints
- Webhook support for DMS messages
- Session-based credential management

## Setup

1. **Install dependencies:**
   ```bash
   cd backend/backend
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Update server configuration** (NO DMS credentials needed):
   ```env
   # Server settings
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080
   WEBHOOK_BASE_URL=http://localhost:3001
   LOG_LEVEL=debug

   # ⚠️ NOTE: Do NOT set JWT_SECRET, CHANNEL_ID, or API_URL here!
   # These are provided dynamically by users through the frontend UI
   ```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## API Endpoints

### Connection Management
- `POST /api/connect` - Connect to DMS with credentials
- `GET /api/status` - Get connection status and active sessions
- `GET /api/health` - Health check endpoint

### Messaging
- `POST /api/send-message` - Send messages to DMS
- `POST /api/end-session` - End chat sessions

### Monitoring
- `GET /api/activity` - Get activity logs
- `GET /api/sessions` - Get active sessions

### Webhooks
- `POST /dms` - Webhook endpoint for DMS messages
- `GET /dms` - Webhook health check

## WebSocket Events

The server broadcasts real-time events via WebSocket:

- `message` - New messages from DMS
- `activity` - API activity logs
- `status` - Connection status changes
- `error` - Error notifications

## Environment Variables

### Server Configuration (Set in .env)
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8080 |
| `WEBHOOK_BASE_URL` | Public URL for webhooks | http://localhost:3001 |
| `LOG_LEVEL` | Logging level | debug |

### DMS Credentials (Provided by users via UI)
⚠️ **These are NOT set in environment variables anymore!**

Users provide these through the frontend configuration panel:
- `customer_id` - Customer identifier
- `jwt_secret` - Pega DMS JWT Secret
- `channel_id` - Pega DMS Channel ID
- `api_url` - Pega DMS API URL

The backend receives these dynamically via the `/api/connect` endpoint.

## Public URL Setup (for webhooks)

For DMS webhooks to work, you need a public URL. Use ngrok for development:

```bash
# Install ngrok
npm install -g ngrok

# Start your backend server
npm run dev

# In another terminal, create a tunnel
ngrok http 3001

# Update WEBHOOK_BASE_URL in .env with your ngrok URL
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io
```

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console output (development)

## DMS Integration

The server integrates with the `dms-client-channel` NPM package and implements all callback methods:

- `onTextMessage` - Handle text messages
- `onMenuMessage` - Handle menu messages  
- `onCarouselMessage` - Handle carousel messages
- `onUrlLinkMessage` - Handle URL link messages
- `onTypingIndicator` - Handle typing indicators
- `onCsrEndSession` - Handle session endings

## Error Handling

Comprehensive error handling includes:
- Request validation
- DMS connection errors
- WebSocket connection management
- Graceful shutdown
- Uncaught exception handling