#!/bin/bash

echo "Starting Backend Server (Port 5005)..."
(cd backend && PORT=5005 npm start) &
BACKEND_PID=$!

echo "Starting Next.js Platform Admin (Port 3000)..."
(cd platform-frontend && npm run dev) &
NEXT_PID=$!

echo "Starting Vite Customer App (Port 5173)..."
(cd customer-app && npm run dev) &
VITE_PID=$!

echo "=========================================="
echo "SaaS Platform Running Successfully!"
echo "Backend API: http://localhost:5005"
echo "Marketing & Admin: http://localhost:3000"
echo "Customer QR App: http://localhost:5173"
echo "=========================================="
echo "Press CTRL+C to stop all servers."

trap "kill $BACKEND_PID $NEXT_PID $VITE_PID" EXIT

wait
