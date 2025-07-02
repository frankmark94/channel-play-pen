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

2. **Configure Environment Variables**:
   Set these in the Render dashboard for `dms-channel-backend`:
   ```env
   JWT_SECRET=your_actual_jwt_secret
   CHANNEL_ID=your_actual_channel_id  
   API_URL=https://your-pega-instance.com/prweb/api/v1/channels/client
   ```

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
# Required - Set in Render Dashboard
JWT_SECRET=your_production_jwt_secret_here
CHANNEL_ID=your_production_channel_id_here
API_URL=https://your-pega-production-instance.com/prweb/api/v1/channels/client

# Auto-configured by Render
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-service.onrender.com
WEBHOOK_BASE_URL=https://your-backend-service.onrender.com

# Optional
LOG_LEVEL=info
```

### Frontend (.env.production)
```env
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
- [ ] Set strong JWT secrets
- [ ] Use HTTPS URLs only
- [ ] Configure proper CORS origins
- [ ] Remove debug logs in production

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
- Verify Pega instance is accessible from Render
- Check JWT token and Channel ID
- Ensure webhook URL is publicly accessible

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