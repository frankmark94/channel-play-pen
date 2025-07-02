# DMS Client Channel API Playground - Complete Integration

## Overview

This is a complete frontend-backend integration for testing Pega Digital Messaging Service (DMS) Client Channel APIs. The system provides a React-based UI with a Node.js/Express backend that integrates with the `dms-client-channel` NPM package.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express Backend│    │   Pega DMS      │
│   (Port 8080)   │◄──►│   (Port 3001)   │◄──►│                 │
│                 │    │                 │    │                 │
│ • Config Panel  │    │ • REST API      │    │ • Message Queue │
│ • Chat Session  │    │ • WebSocket     │    │ • CSR Interface │
│ • Activity Logs │    │ • DMS Client    │    │ • Webhooks      │
│ • Debug Tools   │    │ • Error Handler │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features Implemented

### ✅ Backend Server (Node.js/Express)
- **DMS Client Integration**: Full integration with `dms-client-channel` package
- **REST API Endpoints**: Complete CRUD operations for DMS communication
- **WebSocket Server**: Real-time communication for instant message updates
- **Error Handling**: Comprehensive error logging and user-friendly messages
- **Security**: CORS configuration, input validation, secure credential handling
- **Logging**: Winston-based logging with activity tracking

### ✅ Frontend Integration (React/TypeScript)
- **Real API Calls**: All mock functions replaced with actual backend communication
- **Real-time Updates**: WebSocket integration for live message and activity updates
- **Enhanced UX**: Loading states, error handling, validation feedback
- **Live Activity Logs**: Real-time display of API requests, responses, and errors
- **Debug Information**: Live connection status, session data, and API monitoring

### ✅ DMS Features Supported
- **Connection Management**: Connect/disconnect from Pega DMS
- **Message Sending**: Text and rich content message support
- **Message Receiving**: All DMS callback handlers implemented
- **Session Management**: Session creation, monitoring, and termination
- **Webhook Support**: Endpoint for receiving DMS webhook notifications

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Pega DMS credentials

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
# In root directory
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/health

## Configuration

### Backend Environment Variables

```env
# Pega DMS Configuration
JWT_SECRET=your_jwt_secret_here
CHANNEL_ID=your_channel_id_here
API_URL=https://your-pega-instance.com/prweb/api/v1/channels/client

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Webhook Configuration (for production)
WEBHOOK_BASE_URL=https://your-public-url.com
```

### Frontend Configuration

The frontend automatically connects to the backend on `http://localhost:3001`. No additional configuration needed for development.

## API Endpoints

### Connection Management
- `POST /api/connect` - Connect to DMS with credentials
- `GET /api/status` - Get connection status and sessions
- `GET /api/health` - Health check

### Messaging
- `POST /api/send-message` - Send messages to DMS
- `POST /api/end-session` - End chat sessions

### Monitoring
- `GET /api/activity` - Get activity logs
- `GET /api/sessions` - Get active sessions

### Webhooks
- `POST /dms` - Webhook endpoint for DMS notifications

## Real-time Features

### WebSocket Events
- `message` - New messages from DMS
- `activity` - API activity logs
- `status` - Connection status changes
- `error` - Error notifications

### Live Updates
- **Chat Messages**: Instant display of DMS responses
- **Activity Logs**: Real-time API request/response monitoring
- **Connection Status**: Live status indicators
- **Debug Data**: Real-time session and configuration updates

## Usage Guide

### 1. Configure Connection
1. Fill in Customer ID, Channel ID, JWT Secret, and DMS URL
2. Click "Connect to DMS" to establish connection
3. Monitor connection status in real-time

### 2. Send Messages
1. Ensure connection is established (green status)
2. Type message in chat input
3. Select message type (Text/Rich Content)
4. Click "Send" or press Enter
5. Monitor in Activity Panel for API logs

### 3. Monitor Activity
- **Activity Panel**: Shows all API requests/responses with timing
- **Debug Tools**: Displays connection status, sessions, and raw data
- **Chat Session**: Shows conversation flow with timestamps

### 4. Debug Issues
- Check Activity Panel for error details
- Use Debug Tools to view raw API responses
- Monitor WebSocket connection status
- Check backend logs for detailed error information

## Development Features

### Mock Mode
The backend includes a mock DMS client for development when the actual `dms-client-channel` package is not available. It simulates:
- Connection establishment
- Message sending/receiving
- Callback handlers
- Error conditions

### Logging
Comprehensive logging includes:
- Request/response timing
- Error tracking with stack traces
- WebSocket connection events
- DMS callback executions

### Error Handling
- Input validation with user-friendly messages
- Network error recovery
- WebSocket reconnection logic
- Graceful degradation when DMS is unavailable

## Production Deployment

### 1. Environment Setup
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
# Deploy dist/ folder to your web server
```

### 2. Public URL for Webhooks
Use ngrok or similar for webhook support:
```bash
ngrok http 3001
# Update WEBHOOK_BASE_URL in backend .env
```

### 3. SSL/HTTPS
- Configure reverse proxy (nginx) for HTTPS
- Update CORS settings for production domains
- Use environment-specific configurations

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify DMS credentials in backend .env
   - Check network connectivity to Pega instance
   - Review backend logs for detailed errors

2. **WebSocket Disconnections**
   - Check browser console for WebSocket errors
   - Verify CORS settings
   - Monitor network stability

3. **Message Send Failures**
   - Ensure DMS connection is active
   - Verify Customer ID is set
   - Check Activity Panel for error details

4. **No Real-time Updates**
   - Confirm WebSocket connection (check browser dev tools)
   - Restart both frontend and backend
   - Verify port 3001 is accessible

### Debug Commands

```bash
# Backend logs
cd backend && npm run dev

# Frontend console
# Open browser dev tools, check Console and Network tabs

# API testing
curl http://localhost:3001/api/health
curl http://localhost:3001/api/status
```

## Next Steps

1. **Production Hardening**
   - Add authentication/authorization
   - Implement rate limiting
   - Add SSL certificates
   - Configure monitoring

2. **Enhanced Features**
   - File upload support
   - Message templates
   - Bulk message operations
   - Advanced debugging tools

3. **Testing**
   - Unit tests for API endpoints
   - Integration tests for DMS flow
   - End-to-end testing
   - Performance testing

## Support

For issues and questions:
1. Check the Activity Panel for error details
2. Review backend logs in `backend/logs/`
3. Use Debug Tools for connection diagnostics
4. Refer to Pega DMS documentation for API details