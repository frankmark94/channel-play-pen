# DMS Client Channel Backend

Backend server for the Pega DMS Client Channel API Playground.

## Features

- Express.js server with TypeScript
- Real-time WebSocket communication
- Integration with Pega DMS Client Channel
- Comprehensive error handling and logging
- RESTful API endpoints
- Webhook support for DMS messages

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env` and update with your Pega DMS credentials:
   ```bash
   cp .env.example .env
   ```

3. **Update environment variables:**
   ```env
   JWT_SECRET=your_jwt_secret_here
   CHANNEL_ID=your_channel_id_here
   API_URL=https://your-pega-instance.com/prweb/api/v1/channels/client
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

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Pega DMS JWT Secret | - |
| `CHANNEL_ID` | Pega DMS Channel ID | - |
| `API_URL` | Pega DMS API URL | - |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:8080 |
| `WEBHOOK_BASE_URL` | Public URL for webhooks | - |
| `LOG_LEVEL` | Logging level | debug |

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