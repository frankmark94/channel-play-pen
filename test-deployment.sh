#!/bin/bash

# Pre-deployment test script
echo "🧪 Testing deployment configuration..."

# Test backend build
echo "📦 Testing backend build..."
cd backend/backend
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Test backend start (briefly)
echo "🚀 Testing backend start..."
npm start &
BACKEND_PID=$!
sleep 5

# Test backend health endpoint
echo "🏥 Testing backend health..."
curl -f http://localhost:10000/api/health

if [ $? -eq 0 ]; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
fi

# Stop backend
kill $BACKEND_PID 2>/dev/null

# Return to root
cd ../..

# Test frontend build
echo "📦 Testing frontend build..."
npm install
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ All deployment tests passed!"
echo "🚀 Ready for deployment to Render.com"