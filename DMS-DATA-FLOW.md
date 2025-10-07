# DMS Data Flow Documentation

## Overview

This document describes the complete data flow for the Client Channel API Playground when integrated with Pega Digital Messaging System (DMS).

## Architecture Components

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │   Backend   │ ◄─────► │  Pega DMS   │
│  (React)    │  HTTP/WS │  (Node.js)  │   JWT   │   Server    │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              │
                        ┌─────▼──────┐
                        │ dms-client │
                        │  -channel  │
                        │   v1.2.1   │
                        └────────────┘
```

## Message Flow Patterns

### 1. Customer → CSR (Outbound Messages)

**Flow:**
```
Frontend → Backend API → DMS Client → Pega DMS → CSR Interface
```

**Step-by-Step:**

1. **Frontend sends message** (`src/pages/Index.tsx`)
   ```typescript
   POST /api/send-message
   {
     customer_id: "test-customer-123",
     message: "Hello, I need help",
     message_type: "text"
   }
   ```

2. **Backend receives request** (`backend/src/routes/api.ts:120`)
   - Validates request payload
   - Logs: `💬 Send message request received`
   - Calls DMS service

3. **DMS Service processes** (`backend/src/services/dmsService.ts:262`)
   - Generates unique message ID (UUID)
   - Logs: `📤 Sending text message to DMS`
   - Calls `client.sendTextMessage(customerId, messageId, text, customerName, callback)`

4. **dms-client-channel package** (`node_modules/dms-client-channel`)
   - Creates JWT token using `JWT_SECRET`
   - Makes HTTP POST to `API_URL/messages`
   - Headers:
     ```
     Authorization: Bearer <JWT_TOKEN>
     Content-Type: application/json
     ```
   - Payload:
     ```json
     {
       "customer_id": "test-customer-123",
       "message_id": "<UUID>",
       "text": "Hello, I need help",
       "customer_name": "Customer"
     }
     ```

5. **Pega DMS receives message**
   - Validates JWT signature
   - Routes to appropriate CSR/Bot
   - Returns HTTP response (200 = success)

6. **Response callback** (`dmsService.ts:287`)
   - Logs: `✅ DMS API Response` with status, statusText, duration
   - Updates session info
   - Logs activity: `Sent text message to DMS`

7. **API responds to frontend** (`api.ts:171`)
   - Logs: `✅ Message sent to DMS`
   - Returns success JSON

### 2. CSR → Customer (Inbound Messages via Webhook)

**Flow:**
```
CSR Interface → Pega DMS → Webhook → DMS Client → Backend → WebSocket → Frontend
```

**Step-by-Step:**

1. **CSR sends message in Pega**
   - CSR types response in Pega interface
   - Pega DMS processes the message

2. **Pega DMS sends webhook**
   ```
   POST https://your-backend.onrender.com/dms
   ```
   - Includes JWT token for authentication
   - Payload contains message data

3. **Backend webhook receives** (`backend/src/routes/webhook.ts:11`)
   - Logs: `🔔 Received DMS webhook request`
   - Logs headers, body, URL, method

4. **Webhook delegates to DMS client** (`webhook.ts:37`)
   ```typescript
   client.onRequest(req, (status, message) => {
     res.status(status).send(message);
   });
   ```
   - DMS client validates JWT
   - Parses message type (text, menu, carousel, url_link)
   - Triggers appropriate callback

5. **DMS Service callback fires** (`dmsService.ts:132-259`)

   **For text messages** (`onTextMessage`):
   - Logs: `📨 Received text message from DMS`
   - Creates DMSMessage object
   - Logs activity: `Received text message from DMS`
   - Emits `message` event

   **For menu messages** (`onMenuMessage`):
   - Logs: `📋 Received menu message from DMS`
   - Similar processing

   **For carousel messages** (`onCarouselMessage`):
   - Logs: `🎠 Received carousel message from DMS`

   **For URL links** (`onUrlLinkMessage`):
   - Logs: `🔗 Received URL link message from DMS`

   **For typing indicator** (`onTypingIndicator`):
   - Logs: `⌨️  CSR is typing`

   **For session end** (`onCsrEndSession`):
   - Logs: `🛑 CSR ended session`
   - Updates session status to 'ended'

6. **WebSocket broadcasts** (`backend/src/services/websocketService.ts`)
   - Backend listens to DMS service events
   - Broadcasts to connected frontend clients
   - Real-time update appears in browser

7. **Frontend receives update** (`src/pages/Index.tsx`)
   - WebSocket listener updates chat UI
   - Message appears in chat session
   - Activity log shows new entry

## Connection Flow

### Initial Connection

1. **User inputs credentials in frontend**
   - Customer ID
   - Channel ID
   - JWT Secret
   - Digital Messaging URL (API_URL)

2. **Frontend sends connect request**
   ```typescript
   POST /api/connect
   {
     customer_id: "test-customer-123",
     channel_id: "your-channel-id",
     jwt_secret: "your-jwt-secret",
     api_url: "https://pega-instance.com/prweb/api/v1/channels/client"
   }
   ```

3. **Backend validates and stores credentials** (`api.ts:22`)
   - Logs: `🔌 Connect request received`
   - Validates format using Zod schemas
   - Logs: `📝 Credentials stored`
   - Stores in CredentialManager (session-based)

4. **Backend connects to DMS** (`dmsService.ts:51`)
   - Logs: `Attempting to connect to DMS`
   - Creates dms-client-channel instance:
     ```typescript
     createDMSInstance({
       JWT_SECRET: config.jwt_secret,
       CHANNEL_ID: config.channel_id,
       API_URL: config.api_url
     })
     ```
   - Enables request logging: `client.logRequests(true)`
   - Sets up all callbacks (onTextMessage, onMenuMessage, etc.)
   - Logs: `✅ Successfully connected to DMS with real client`

5. **Frontend receives confirmation**
   - Connection status shows "Connected"
   - Webhook URL displays: `https://your-backend.onrender.com/dms`
   - Ready to send/receive messages

## Error Handling

### Validation Errors

**Frontend validation fails:**
```
User Input → Frontend Validation → Error displayed in UI
```

**Backend validation fails:**
```
Request → Validation → 400 Response with errors → Frontend shows error
```

### DMS API Errors

**Message send fails:**
```typescript
// dmsService.ts:313
if (response.status >= 200 && response.status < 300) {
  // Success path
} else {
  // Error path
  logger.error('DMS API returned error status')
  reject(new Error(`DMS API error: ${response.status}`))
}
```

**Logged as:**
- `❌ Failed to send text message to DMS`
- Includes: error message, customer_id, duration_ms

### Webhook Errors

**DMS client not initialized:**
```typescript
// webhook.ts:22
if (!client) {
  logger.error('❌ DMS client not initialized')
  return res.status(503).json({ error: 'DMS client not initialized' })
}
```

**Webhook processing fails:**
```typescript
// webhook.ts:48
catch (error) {
  logger.error('❌ Error processing DMS webhook')
  res.status(500).json({ error: 'Error processing webhook' })
}
```

## Key Configuration

### Environment Variables

**Backend (`backend/.env`):**
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
WEBHOOK_BASE_URL=http://localhost:3001
LOG_LEVEL=debug

# DMS credentials provided dynamically by users via frontend
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:3001
```

### DMS Client Configuration

**Created in `dmsService.ts:60`:**
```typescript
createDMSInstance({
  JWT_SECRET: config.jwt_secret,    // User-provided
  CHANNEL_ID: config.channel_id,    // User-provided
  API_URL: config.api_url           // User-provided
})
```

## Message Types

### Text Messages
- **Outbound:** `sendTextMessage(customerId, messageId, text, customerName, callback)`
- **Inbound:** `onTextMessage = (message) => {...}`

### Menu Messages
- **Inbound:** `onMenuMessage = (message) => {...}`
- Contains: title, items array

### Carousel Messages
- **Inbound:** `onCarouselMessage = (message) => {...}`
- Contains: items array with cards

### URL Link Messages
- **Inbound:** `onUrlLinkMessage = (message) => {...}`
- Contains: title, label, url

### System Events
- **Typing Indicator:** `onTypingIndicator = (customer_id) => {...}`
- **Session End:** `onCsrEndSession = (customer_id) => {...}`

## Logging Strategy

### Log Levels

- **debug**: Detailed technical info (sent only in development)
- **info**: Normal operational messages with emojis for visibility
- **warn**: Validation failures, non-critical issues
- **error**: Failures, exceptions, stack traces

### Emoji Log Indicators

- 🔌 Connection requests
- 💬 Message send requests
- 📤 Outbound to DMS
- 📨 Inbound text messages
- 📋 Menu messages
- 🎠 Carousel messages
- 🔗 URL link messages
- ⌨️  Typing indicators
- 🛑 Session end
- 🔔 Webhook received
- ✅ Success operations
- ❌ Errors/failures
- 📝 Data storage

### Activity Logging

**Tracked in `dmsService.ts:428`:**
```typescript
logActivity({
  type: 'request' | 'response' | 'system' | 'error',
  method?: string,
  message: string,
  data: any,
  duration_ms?: number,
  status_code?: number
})
```

**Stored in memory:**
- Last 1000 logs kept
- Available via `/api/activity`
- Displayed in frontend Activity Panel

## Security

### JWT Authentication

1. **Token Generation** (dms-client-channel)
   - Signs payload with `JWT_SECRET`
   - Includes channel_id, customer_id, timestamp
   - Sent in Authorization header

2. **Token Validation** (Pega DMS)
   - Validates signature
   - Checks expiration
   - Verifies channel_id matches

### Credential Storage

- **Session-based:** Credentials stored per-session in backend memory
- **Not persistent:** Cleared on disconnect or server restart
- **Frontend:** Saved in localStorage for convenience
- **No server storage:** JWT secrets never stored in database

## Testing & Debugging

### Debug Endpoints

**Health Check:**
```
GET /api/health
```
Returns: server status, DMS connection, uptime, memory

**Connection Status:**
```
GET /api/status
```
Returns: connection info, active sessions, recent activity

**Activity Logs:**
```
GET /api/activity?limit=100
```
Returns: last N activity log entries

**Sessions:**
```
GET /api/sessions
```
Returns: all active sessions

### Debugging Tips

1. **Check logs for emojis** - Quick visual indicators of flow
2. **Monitor /api/activity** - See all DMS interactions
3. **Watch WebSocket messages** - Real-time event stream
4. **Verify JWT_SECRET** - Most common connection issue
5. **Check API_URL** - Must match your Pega instance exactly
6. **Test webhook accessibility** - Pega must reach `WEBHOOK_BASE_URL/dms`

## Production Deployment

### Render.com Setup

1. **Backend service needs:**
   - `FRONTEND_URL` = Your frontend URL
   - `WEBHOOK_BASE_URL` = Your backend URL
   - Port 10000 (Render default)

2. **Frontend service needs:**
   - `VITE_API_BASE_URL` = Your backend URL

3. **User provides at runtime:**
   - Customer ID
   - Channel ID
   - JWT Secret
   - Digital Messaging URL

### Pega DMS Configuration

1. **Configure webhook in Pega:**
   - URL: `https://your-backend.onrender.com/dms`
   - Method: POST
   - Authentication: JWT (if required)

2. **Channel Settings:**
   - Channel ID matches user input
   - JWT secret matches user input
   - API endpoint accessible from Render

## Troubleshooting

### Messages not sending

1. **Check connection status** - Must show "Connected"
2. **Verify credentials** - JWT_SECRET, CHANNEL_ID, API_URL
3. **Check backend logs** - Look for `📤 Sending text message to DMS`
4. **Check API response** - Should see `✅ DMS API Response` with 200 status
5. **Test API URL** - Ensure Pega instance is reachable

### Messages not receiving

1. **Verify webhook URL** - Must be publicly accessible
2. **Check webhook logs** - Should see `🔔 Received DMS webhook request`
3. **Check DMS client logs** - Should see `📨 Received text message from DMS`
4. **Test WebSocket** - Frontend must be connected via WS
5. **Check Pega config** - Webhook must point to correct URL

### Connection failures

1. **JWT_SECRET validation** - Check format and length
2. **CHANNEL_ID validation** - Must match Pega channel
3. **API_URL validation** - Must be valid HTTPS URL
4. **Network access** - Backend must reach Pega instance
5. **CORS issues** - Check `FRONTEND_URL` env var

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        OUTBOUND FLOW                            │
│  (Customer → CSR)                                               │
└─────────────────────────────────────────────────────────────────┘

1. User types message in browser
                │
                ▼
2. Frontend: POST /api/send-message
   └─> { customer_id, message, message_type }
                │
                ▼
3. Backend: api.ts validates request
   └─> Logs: 💬 Send message request received
                │
                ▼
4. dmsService.ts: sendTextMessage()
   └─> Logs: 📤 Sending text message to DMS
   └─> Generates message_id (UUID)
                │
                ▼
5. dms-client-channel: Creates JWT token
   └─> POST to API_URL/messages
   └─> Headers: Authorization: Bearer <JWT>
   └─> Body: { customer_id, message_id, text, customer_name }
                │
                ▼
6. Pega DMS: Receives & validates
   └─> Routes to CSR/Bot
   └─> Returns 200 OK
                │
                ▼
7. Response callback: Logs success
   └─> Logs: ✅ DMS API Response (200)
   └─> Updates session
   └─> Logs activity
                │
                ▼
8. API responds to frontend
   └─> Logs: ✅ Message sent to DMS
   └─> Returns: { success: true, message_sent: true }


┌─────────────────────────────────────────────────────────────────┐
│                        INBOUND FLOW                             │
│  (CSR → Customer)                                               │
└─────────────────────────────────────────────────────────────────┘

1. CSR sends message in Pega
                │
                ▼
2. Pega DMS: Processes message
   └─> Sends webhook to backend
                │
                ▼
3. Backend webhook.ts: POST /dms
   └─> Logs: 🔔 Received DMS webhook request
   └─> Logs: headers, body, URL, method
                │
                ▼
4. Webhook calls: client.onRequest(req, callback)
   └─> DMS client validates JWT
   └─> Parses message type
                │
                ▼
5. DMS client triggers callback
   └─> onTextMessage(message)
   └─> Logs: 📨 Received text message from DMS
   └─> Creates DMSMessage object
   └─> Emits 'message' event
                │
                ▼
6. WebSocket service broadcasts
   └─> Sends to all connected clients
                │
                ▼
7. Frontend receives via WebSocket
   └─> Updates chat UI
   └─> Shows message in conversation
   └─> Updates activity log


┌─────────────────────────────────────────────────────────────────┐
│                      CONNECTION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. User inputs credentials in frontend
   └─> Customer ID, Channel ID, JWT Secret, API URL
                │
                ▼
2. Frontend: POST /api/connect
   └─> { customer_id, channel_id, jwt_secret, api_url }
                │
                ▼
3. Backend validates credentials
   └─> Logs: 🔌 Connect request received
   └─> Zod schema validation
   └─> Credential format validation
                │
                ▼
4. Store credentials in memory
   └─> Logs: 📝 Credentials stored
   └─> Session ID generated
                │
                ▼
5. Disconnect existing (if any)
                │
                ▼
6. Create DMS client instance
   └─> createDMSInstance({ JWT_SECRET, CHANNEL_ID, API_URL })
   └─> Enable request logging
   └─> Setup callbacks (onTextMessage, onMenuMessage, etc.)
   └─> Logs: ✅ Successfully connected to DMS with real client
                │
                ▼
7. Return success to frontend
   └─> Frontend shows "Connected"
   └─> Webhook URL displayed
   └─> Ready to send/receive
```

## Implementation Checklist

- [x] Real DMS client integration (dms-client-channel v1.2.1)
- [x] Dynamic credential management (session-based)
- [x] Comprehensive logging with emojis
- [x] Webhook handler using `client.onRequest()`
- [x] Text message support (send/receive)
- [x] Menu message support (receive)
- [x] Carousel message support (receive)
- [x] URL link message support (receive)
- [x] Typing indicator support (receive)
- [x] Session end support (receive)
- [x] Activity logging system
- [x] Error handling and validation
- [x] WebSocket real-time updates
- [x] Frontend localStorage persistence
- [x] Render.com deployment configuration
- [ ] Rich content message support (send)
- [ ] Session management methods
- [ ] Production testing with real Pega instance
