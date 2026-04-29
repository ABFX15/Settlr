#!/bin/bash

# Start Next.js dev server and SSL proxy for https://localhost:3001

echo "🚀 Starting Offbank development with HTTPS..."
echo ""
echo "📍 HTTP:   http://localhost:3000"
echo "🔒 HTTPS:  https://localhost:3001"
echo ""

# Kill any existing processes on these ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start Next.js in background
npm run dev &
NEXT_PID=$!

# Wait for Next.js to start
sleep 3

# Start SSL proxy
echo "🔐 Starting SSL proxy..."
local-ssl-proxy --source 3001 --target 3000 --cert offbankpay.com+2.pem --key offbankpay.com+2-key.pem &
PROXY_PID=$!

echo ""
echo "✅ Ready! Visit https://offbankpay.com:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  kill $NEXT_PID 2>/dev/null
  kill $PROXY_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
