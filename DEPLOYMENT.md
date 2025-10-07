# 🚀 Render.com Deployment Guide

## Quick Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Add Render.com deployment configuration"
git push origin main
```

### 2. Deploy to Render.com

#### Option A: Using render.yaml (Recommended)
1. **Connect Repository**:
   - Go to [Render.com Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

2. **✨ No DMS Credentials Required! 🎉**:
   The app now accepts user credentials dynamically through the UI:
   - ✅ No hardcoded DMS credentials in environment variables
   - ✅ Users input their own JWT Secret, Channel ID, Customer ID, and API URL
   - ✅ Perfect for demos where multiple users test with different credentials
   - ✅ One deployment serves everyone - no need to redeploy for each user
   - ✅ More secure - credentials are session-based, not stored in env vars

3. **Required Environment Variables** (Only server config, no DMS creds):
   - `FRONTEND_URL` - Auto-set by Render (your frontend URL)
   - `WEBHOOK_BASE_URL` - Auto-set by Render (your backend URL)
   - `NODE_ENV=production`
   - `PORT=10000`
   - `LOG_LEVEL=info`

#### Option B: Manual Service Creation

**Backend Service:**
1. New → Web Service
2. Connect repository
3. Settings:
   - **Name**: `dms-channel-backend`
   - **Runtime**: Node
   - **Build Command**: `cd backend/backend && npm install && npm run build`
   - **Start Command**: `cd backend/backend && npm start`
   - **Environment Variables**: (same as above)

**Frontend Service:**
1. New → Static Site
2. Connect same repository
3. Settings:
   - **Name**: `dms-channel-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```env
     VITE_API_BASE_URL=https://dms-channel-backend.onrender.com
     ```

### 3. Post-Deployment Configuration

1. **Update URLs**: Once deployed, update these files with your actual Render URLs:
   - `render.yaml` (if using blueprint)
   - Backend environment variables
   - Frontend environment variables

2. **Test Deployment**:
   - Backend: `https://your-backend.onrender.com/api/health`
   - Frontend: `https://your-frontend.onrender.com`

## Environment Variables Reference

### Backend (.env.production)
```env
# Server Configuration (Required - Set in Render Dashboard)
NODE_ENV=production
PORT=10000
LOG_LEVEL=info

# Auto-configured by Render (via render.yaml)
FRONTEND_URL=https://your-frontend-service.onrender.com
WEBHOOK_BASE_URL=https://your-backend-service.onrender.com

# Optional Performance Settings
MAX_CONCURRENT_CONNECTIONS=100
SESSION_TIMEOUT_MINUTES=30

# ⚠️ DMS CREDENTIALS NO LONGER NEEDED HERE!
# Users provide these through the UI configuration panel:
# - JWT_SECRET (entered by user in UI)
# - CHANNEL_ID (entered by user in UI)
# - API_URL (entered by user in UI)
# - CUSTOMER_ID (entered by user in UI)
```

### Frontend (.env.production)
```env
# Backend API URL (auto-configured by Render via render.yaml)
VITE_API_BASE_URL=https://your-backend-service.onrender.com
```

## Service Configuration

### Backend Service
- **Type**: Web Service
- **Runtime**: Node.js
- **Port**: 10000
- **Health Check**: `/api/health`
- **Auto Deploy**: Yes (on git push)

### Frontend Service
- **Type**: Static Site
- **Build Tool**: Vite
- **Deploy**: `dist/` folder
- **Auto Deploy**: Yes (on git push)

## Production Considerations

### Security
- [x] **No hardcoded secrets** - Credentials provided by users at runtime
- [ ] Users should use strong JWT secrets (validated in UI)
- [ ] Use HTTPS URLs only (enforced in production)
- [ ] Configure proper CORS origins (set via FRONTEND_URL)
- [ ] Remove debug logs in production (LOG_LEVEL=info)

### Performance
- [ ] Enable gzip compression (handled by Render)
- [ ] Monitor response times
- [ ] Set up health checks
- [ ] Configure proper logging

### Monitoring
- [ ] Use Render's built-in logs
- [ ] Set up alerts for downtime
- [ ] Monitor DMS connection health
- [ ] Track API usage patterns

## Troubleshooting

### Common Deployment Issues

**1. Build Failures**
```bash
# Check logs in Render dashboard
# Common fixes:
- Ensure Node.js version compatibility
- Check package.json scripts
- Verify file paths in build commands
```

**2. Environment Variables**
- Double-check all required env vars are set
- Ensure no typos in variable names
- Check for trailing spaces in values

**3. CORS Issues**
- Verify frontend URL is in backend CORS list
- Check that URLs use HTTPS in production
- Ensure environment variables are properly set

**4. DMS Connection Issues**
- Verify Pega instance is accessible from Render (test from browser)
- Ensure users enter correct JWT Secret, Channel ID, and API URL in UI
- Check that webhook URL (WEBHOOK_BASE_URL) is publicly accessible
- Verify Customer ID format is correct
- Test connection using the "Connect to DMS" button in the UI

### Debug Commands

**Check Backend Health:**
```bash
curl https://your-backend.onrender.com/api/health
```

**Check Environment Setup:**
```bash
curl https://your-backend.onrender.com/api/status
```

**View Logs:**
- Go to Render Dashboard → Service → Logs
- Check both Build and Runtime logs

## Scaling and Optimization

### For Production Use:
1. **Upgrade Render Plan**: For better performance and reliability
2. **Database**: Add persistent storage for logs/sessions
3. **CDN**: Use Render's CDN for frontend assets
4. **Monitoring**: Integrate with external monitoring tools

### Cost Optimization:
- Use Render's free tier for testing
- Implement proper sleep/wake patterns
- Monitor resource usage

## Webhook Configuration

For production DMS webhooks:
1. Your webhook URL will be: `https://your-backend.onrender.com/dms`
2. Configure this in your Pega DMS settings
3. Ensure webhook authentication if required

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node-version)
- [Static Sites on Render](https://render.com/docs/static-sites)
- [Environment Variables](https://render.com/docs/environment-variables)

## Next Steps After Deployment

1. **Test Full Flow**: Connect → Send Messages → Receive Responses
2. **Monitor Performance**: Check response times and error rates
3. **Set Up Alerts**: Configure notifications for downtime
4. **Documentation**: Update team with new URLs and procedures
5. **Backup**: Document environment variables securely