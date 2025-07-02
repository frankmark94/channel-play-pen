# 🔒 Security & Credential Handling

## How Credentials Work

### ✅ User-Provided Credentials
- **No hardcoded secrets**: Users input their own Pega DMS credentials
- **Session-based**: Credentials are stored temporarily per user session
- **Auto-cleanup**: Credentials are automatically removed after 30 minutes of inactivity
- **No persistence**: Credentials are never saved to disk or database

### 🔐 Credential Security

**Frontend Security:**
- Credentials are stored in browser memory only
- JWT secrets are masked in password fields
- No credentials saved in localStorage or cookies
- Credentials cleared when browser tab is closed

**Backend Security:**
- Credentials hashed for logging (only first 8 chars of SHA-256)
- Automatic session cleanup every 5 minutes
- Memory-only storage (no file or database persistence)
- Credentials removed on server restart

**Network Security:**
- All API calls use HTTPS in production
- Credentials sent via secure POST requests
- CORS properly configured for production domains

### 🚀 Production Deployment

**What's NOT stored in environment variables:**
- ❌ JWT_SECRET 
- ❌ CHANNEL_ID
- ❌ API_URL

**What IS stored in environment variables:**
- ✅ PORT (10000)
- ✅ NODE_ENV (production)
- ✅ FRONTEND_URL (auto-set by Render)
- ✅ LOG_LEVEL (info)

### 🛡️ Security Best Practices

**For Users:**
1. **Use test credentials** when possible for demos
2. **Don't share credentials** in screenshots or logs
3. **Regenerate JWT secrets** periodically in Pega
4. **Close browser tab** when done to clear credentials

**For Developers:**
1. **Credentials are logged safely** (hashed, not plain text)
2. **Session cleanup** happens automatically
3. **No credential persistence** - restart server to clear all sessions
4. **Rate limiting** can be added if needed

### 📊 What Gets Logged

**Safe to log:**
- ✅ Channel ID (not sensitive)
- ✅ API URL (not sensitive)
- ✅ Customer ID (not sensitive)
- ✅ Connection success/failure
- ✅ Hashed JWT secret (first 8 chars of SHA-256)

**Never logged:**
- ❌ Full JWT secret
- ❌ Complete credential objects
- ❌ User session data beyond connection events

### 🔄 Credential Lifecycle

1. **Input**: User enters credentials in UI
2. **Validation**: Basic format checks on frontend and backend
3. **Storage**: Temporary storage in backend memory with session ID
4. **Usage**: Credentials used for DMS connection only
5. **Cleanup**: Auto-removed after 30 minutes or on server restart

### 🚨 Security Considerations

**This is a demo application:**
- Designed for testing and development
- Not intended for production customer data
- Users should use test environments when possible
- Credentials are handled securely but this is not a production-grade auth system

**For production use, consider:**
- OAuth2/OIDC authentication
- Encrypted credential storage
- Audit logging
- Role-based access control
- Secrets management service (HashiCorp Vault, AWS Secrets Manager, etc.)

### 📞 Support

If you have security questions or concerns:
1. Review the source code (it's open source!)
2. Check the activity logs in the UI for credential usage
3. Restart the backend server to clear all sessions
4. Use test credentials when demonstrating the app