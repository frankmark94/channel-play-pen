# 🚀 Client Channel API Playground

A developer-friendly tool for testing and debugging client channel integrations with **Pega's Digital Messaging System (DMS)**.

## ✨ Key Features

- **🔐 No Hardcoded Credentials**: Users provide their own DMS credentials through the UI
- **🌐 Single Deployment, Multiple Users**: One hosted instance serves everyone
- **📊 Real-time Testing**: Interactive chat simulation with live API monitoring
- **🎨 Beautiful UI**: Modern interface built with React + shadcn/ui
- **📡 WebSocket Support**: Real-time message updates from DMS
- **🔍 Debug Tools**: Activity logs, session tracking, and API inspection

## 🏃‍♂️ Quick Start

### Option 1: Use the Hosted Version (Recommended)
Simply visit the deployed app and enter your Pega DMS credentials in the configuration panel:
- Customer ID
- Channel ID
- JWT Secret
- Digital Messaging URL

No deployment needed! Perfect for demos and testing.

### Option 2: Run Locally

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backend/backend
npm install
cd ../..
```

3. **Configure environment**
```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit backend/.env and set:
# - FRONTEND_URL (default: http://localhost:8080)
# - WEBHOOK_BASE_URL (your ngrok URL or localhost)
# - PORT, LOG_LEVEL, etc.
#
# NOTE: No need to set JWT_SECRET, CHANNEL_ID, or API_URL
# These come from the frontend UI!
```

4. **Start the application**
```bash
# Terminal 1: Start backend
cd backend/backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

5. **Open your browser**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

## 🎯 How It Works

### User Flow
1. User opens the web app
2. Enters their Pega DMS credentials in the Configuration Panel
3. Clicks "Connect to DMS"
4. Backend uses those credentials to establish connection
5. User can now send/receive messages through the Client Channel API

### Architecture
- **Frontend**: React + TypeScript + Vite (shadcn/ui components)
- **Backend**: Node.js + Express + WebSocket
- **DMS Integration**: `dms-client-channel` package (or mock for testing)

## 📁 Project Structure

```
├── src/                    # Frontend React app
│   ├── components/        # UI components (ConfigPanel, ChatSession, etc.)
│   ├── lib/              # API client and utilities
│   └── pages/            # Application pages
├── backend/
│   └── backend/          # Backend Express server
│       ├── src/
│       │   ├── routes/   # API endpoints
│       │   ├── services/ # DMS service, websocket, credentials
│       │   └── types/    # TypeScript types
│       └── .env          # Backend config (NO DMS credentials!)
├── public/               # Static assets
└── render.yaml          # Render.com deployment config
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Server Settings
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug

# CORS & URLs
FRONTEND_URL=http://localhost:8080
WEBHOOK_BASE_URL=http://localhost:3001

# ⚠️ DO NOT set these - they come from the UI:
# JWT_SECRET, CHANNEL_ID, API_URL, CUSTOMER_ID
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Render.com:**
1. Push to GitHub
2. Connect repo to Render
3. Render auto-detects `render.yaml`
4. Deploy! 🎉

**No DMS credentials needed in environment variables!**

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket, TypeScript
- **DMS Integration**: dms-client-channel NPM package
- **Deployment**: Render.com (or any Node.js host)

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guide for Claude Code
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [README-INTEGRATION.md](./README-INTEGRATION.md) - DMS integration details
- [SECURITY.md](./SECURITY.md) - Security best practices

## 🤝 Contributing

This project was built with [Lovable](https://lovable.dev). Changes can be made:
1. Via Lovable interface (auto-commits to repo)
2. Via your IDE (push changes normally)
3. Via GitHub directly (edit files in browser)

## 📄 License

See repository for license details.

## 🆘 Support

For issues or questions:
1. Check the docs in this repo
2. Review the [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
3. Open an issue on GitHub
