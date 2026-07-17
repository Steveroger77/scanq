#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "===================================="
echo "🚀 Starting ScanQ Deployment Build..."
echo "===================================="

echo "📦 1/2: Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🐍 2/2: Installing Python Backend Dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "✅ Build Complete!"
