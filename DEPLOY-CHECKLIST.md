# 📋 Render.com Deployment Checklist

## Pre-Deployment ✅

- [ ] All code committed and pushed to GitHub
- [ ] Backend builds successfully (`cd backend/backend && npm run build`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Environment variables documented
- [ ] Pega DMS credentials ready

## Render.com Setup 🚀

### 1. Connect Repository
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click "New" → "Blueprint" 
- [ ] Connect GitHub repository
- [ ] Confirm `render.yaml` detected

### 2. Configure Environment Variables
Set in `dms-channel-backend` service:
- [ ] `JWT_SECRET` = your Pega JWT secret
- [ ] `CHANNEL_ID` = your Pega channel ID
- [ ] `API_URL` = your Pega DMS endpoint URL

### 3. Deploy Services
- [ ] Backend service deploys successfully
- [ ] Frontend service deploys successfully
- [ ] Both services show "Live" status

## Post-Deployment Testing 🧪

### Backend Tests
- [ ] Health check: `https://your-backend.onrender.com/api/health`
- [ ] Status check: `https://your-backend.onrender.com/api/status`
- [ ] CORS working (no console errors)

### Frontend Tests
- [ ] Site loads: `https://your-frontend.onrender.com`
- [ ] Configuration panel works
- [ ] Can connect to backend
- [ ] WebSocket connection established

### Integration Tests
- [ ] Connect to DMS successfully
- [ ] Send test message
- [ ] Receive activity logs
- [ ] Debug tools show live data

## URLs to Save 📝

After deployment, save these URLs:
- **Frontend**: `https://dms-channel-frontend.onrender.com`
- **Backend API**: `https://dms-channel-backend.onrender.com`
- **Health Check**: `https://dms-channel-backend.onrender.com/api/health`

## Next Steps 🎯

- [ ] Update team documentation with new URLs
- [ ] Configure Pega DMS webhooks (if needed)
- [ ] Set up monitoring/alerts
- [ ] Test with real Pega DMS instance
- [ ] Document environment variables securely

## Troubleshooting 🔧

If deployment fails:
1. Check Render build logs
2. Verify environment variables
3. Test builds locally first
4. Check GitHub repository access
5. Review CORS configuration

## Support 💬

- [Render Documentation](https://render.com/docs)
- [GitHub Repository Issues](https://github.com/your-repo/issues)
- Check Activity Panel for API errors
- Review backend logs in Render dashboard