#!/bin/bash

echo "🔍 Checking SerendibGo Project Setup..."

echo ""
echo "📁 Checking project structure..."
if [ -d "backend" ] && [ -d "frontend" ]; then
    echo "✅ Project structure is correct"
else
    echo "❌ Missing backend or frontend directories"
    exit 1
fi

echo ""
echo "📦 Checking backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    echo "✅ Backend package.json exists"
    if grep -q "cookie-parser" package.json; then
        echo "✅ cookie-parser dependency found"
    else
        echo "❌ Missing cookie-parser dependency"
    fi
else
    echo "❌ Backend package.json missing"
fi

echo ""
echo "📦 Checking frontend dependencies..."
cd ../frontend
if [ -f "package.json" ]; then
    echo "✅ Frontend package.json exists"
    if grep -q "daisyui" package.json; then
        echo "✅ DaisyUI dependency found"
    else
        echo "❌ Missing DaisyUI dependency"
    fi
    if grep -q "tailwindcss" package.json; then
        echo "✅ Tailwind CSS dependency found"
    else
        echo "❌ Missing Tailwind CSS dependency"
    fi
else
    echo "❌ Frontend package.json missing"
fi

echo ""
echo "⚙️ Checking configuration files..."
if [ -f "postcss.config.js" ]; then
    echo "✅ PostCSS config exists"
else
    echo "❌ Missing PostCSS config"
fi

if [ -f "tailwind.config.js" ]; then
    echo "✅ Tailwind config exists"
else
    echo "❌ Missing Tailwind config"
fi

if [ -f "vite.config.js" ]; then
    echo "✅ Vite config exists"
else
    echo "❌ Missing Vite config"
fi

echo ""
echo "📄 Checking source files..."
if [ -f "src/App.jsx" ]; then
    echo "✅ App.jsx exists"
else
    echo "❌ Missing App.jsx"
fi

if [ -f "src/main.jsx" ]; then
    echo "✅ main.jsx exists"
else
    echo "❌ Missing main.jsx"
fi

if [ -d "src/components" ]; then
    echo "✅ Components directory exists"
else
    echo "❌ Missing components directory"
fi

if [ -d "src/pages" ]; then
    echo "✅ Pages directory exists"
else
    echo "❌ Missing pages directory"
fi

echo ""
echo "🔧 Checking backend source files..."
cd ../backend
if [ -f "server.js" ]; then
    echo "✅ server.js exists"
else
    echo "❌ Missing server.js"
fi

if [ -d "src" ]; then
    echo "✅ Backend src directory exists"
else
    echo "❌ Missing backend src directory"
fi

echo ""
echo "🎯 Setup Check Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Create .env files in both backend and frontend directories"
echo "2. Run 'npm install' in both directories"
echo "3. Start backend: 'npm run dev' in backend directory"
echo "4. Start frontend: 'npm run dev' in frontend directory"
echo ""
echo "🔗 Environment Variables Needed:"
echo "Backend: MONGODB_URI, JWT_SECRET, FROM_EMAIL, EMAIL_PASS"
echo "Frontend: VITE_API_URL"
