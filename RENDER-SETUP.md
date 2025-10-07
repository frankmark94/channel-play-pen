# Render.com Setup Guide

## Quick Setup (5 minutes)

After deploying to Render.com, you need to set **2 environment variables** manually in the Render dashboard.

### Step 1: Set Backend Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **backend service** (`dms-channel-backend`)
3. Go to **Environment** tab
4. Add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `FRONTEND_URL` | Your frontend URL | `https://dms-channel-frontend.onrender.com` |
| `WEBHOOK_BASE_URL` | Your backend URL | `https://dms-channel-backend.onrender.com` |

**Important:** Replace the example URLs with your actual Render service URLs!

4. Click **Save Changes**
5. Render will automatically redeploy your backend

### Step 2: Set Frontend Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **frontend service** (`dms-channel-frontend`)
3. Go to **Environment** tab
4. Add this variable:

| Key | Value | Example |
|-----|-------|---------|
| `VITE_API_BASE_URL` | Your backend URL | `https://dms-channel-backend.onrender.com` |

**Important:** Use the full HTTPS URL, not just the hostname!

4. Click **Save Changes**
5. Render will automatically rebuild your frontend

### Step 3: Verify Setup

1. **Check backend health:**
   ```
   https://your-backend.onrender.com/api/health
   ```
   Should return JSON with `status: "healthy"`

2. **Open frontend:**
   ```
   https://your-frontend.onrender.com
   ```

3. **Check webhook URL in UI:**
   - The "Client Webhook URL" field should show:
     `https://your-backend.onrender.com/dms`
   - This is auto-detected from `VITE_API_BASE_URL`!

### Step 4: Test with Your Credentials

1. Open the frontend
2. Fill in Configuration Panel:
   - **Customer ID**: Your customer identifier
   - **Channel ID**: Your Pega DMS channel ID
   - **JWT Secret**: Your Pega DMS JWT secret
   - **Digital Messaging URL**: Your Pega instance API URL
3. Click **Connect to DMS**
4. Should see "Connected" status!

---

## Why These Variables Are Needed

### `FRONTEND_URL` (Backend)
- Used for CORS configuration
- Allows frontend to make API requests to backend
- **Must** match your actual frontend URL

### `WEBHOOK_BASE_URL` (Backend)
- Used when registering webhooks with Pega DMS
- Pega will send messages to `{WEBHOOK_BASE_URL}/dms`
- **Must** be publicly accessible HTTPS URL

### `VITE_API_BASE_URL` (Frontend)
- Tells frontend where to send API requests
- Used to auto-calculate webhook URL
- **Must** match your backend URL

---

## Finding Your Service URLs

Your Render service URLs follow this pattern:
- Backend: `https://<service-name>.onrender.com`
- Frontend: `https://<service-name>.onrender.com`

You can find them in the Render dashboard at the top of each service page.

---

## Troubleshooting

### ❌ Backend shows "CORS error"
**Fix:** Make sure `FRONTEND_URL` is set correctly to your frontend's actual URL

### ❌ Frontend can't connect to backend
**Fix:** Make sure `VITE_API_BASE_URL` is set correctly to your backend's actual URL

### ❌ Webhook URL shows "localhost"
**Fix:** Make sure frontend's `VITE_API_BASE_URL` is set (it auto-calculates webhook URL)

### ❌ DMS can't send webhooks
**Fix:** Make sure `WEBHOOK_BASE_URL` is set to your backend's public HTTPS URL

---

## Configuration Persistence

✅ **Your DMS credentials are now saved!**

When you enter credentials in the UI and click "Connect to DMS":
- Configuration is saved to browser localStorage
- Persists across page reloads
- Each user's credentials are stored locally in their browser
- No credentials are stored on the server

To clear saved credentials:
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Delete the `dmsConfig` item

---

## Production Checklist

- [ ] `FRONTEND_URL` set in backend environment
- [ ] `WEBHOOK_BASE_URL` set in backend environment
- [ ] `VITE_API_BASE_URL` set in frontend environment
- [ ] Both services deployed and running
- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Webhook URL auto-detects correctly in UI
- [ ] Can connect with test credentials

---

## Need Help?

1. Check Render logs: Dashboard → Service → Logs
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
3. See [CHANGES.md](./CHANGES.md) for architecture details
