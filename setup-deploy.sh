#!/bin/bash
# Interactive Railway & Vercel Setup Script

echo "🚀 Amrikyy Deployment Setup"
echo "============================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ All prerequisites installed"
echo ""

# Check if logged in
echo "🔐 Checking authentication..."

if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway"
    echo "Please run: railway login"
    echo "Then re-run this script"
    exit 1
fi

if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged into Vercel"
    echo "Please run: vercel login"
    echo "Then re-run this script"
    exit 1
fi

echo "✅ Logged into both Railway and Vercel"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1. Deploy Backend to Railway"
echo "2. Deploy Frontend to Vercel"
echo "3. Deploy Both (Full Setup)"
echo "4. Check Deployment Status"
echo "5. Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🛤️ Deploying Backend to Railway..."
        cd backend

        if ! railway status &> /dev/null; then
            echo "Creating Railway project..."
            railway init
            echo "Project created! Now configure environment variables in Railway dashboard."
            echo "See: https://railway.app/project/YOUR_PROJECT/variables"
        fi

        echo "Deploying..."
        railway up

        echo "✅ Backend deployed!"
        echo "Get your Railway URL with: railway status"
        ;;
    2)
        echo "⚡ Deploying Frontend to Vercel..."
        cd "$(dirname "$0")"

        echo "Deploying frontend..."
        vercel --prod

        echo "✅ Frontend deployed!"
        echo "Configure environment variables in Vercel dashboard if needed."
        ;;
    3)
        echo "🚀 Full Deployment Setup..."

        # Backend first
        echo "Step 1: Deploying Backend to Railway..."
        cd backend

        if ! railway status &> /dev/null; then
            echo "Creating Railway project..."
            railway init
        fi

        railway up
        RAILWAY_URL=$(railway status | grep -o 'https://[^ ]*\.railway\.app')

        echo "✅ Backend deployed at: $RAILWAY_URL"
        cd ..

        # Frontend second
        echo ""
        echo "Step 2: Deploying Frontend to Vercel..."
        vercel --prod

        echo ""
        echo "🎉 Deployment Complete!"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Set environment variables in both dashboards"
        echo "2. Update Railway CORS_ORIGIN with Vercel URL"
        echo "3. Test your deployed application"
        echo ""
        echo "📖 See SETUP_RAILWAY_VERCEL.md for detailed instructions"
        ;;
    4)
        echo "📊 Checking deployment status..."

        echo "Railway Status:"
        if railway status &> /dev/null; then
            railway status
        else
            echo "❌ No Railway project linked"
        fi

        echo ""
        echo "Vercel Status:"
        vercel ls 2>/dev/null || echo "❌ No Vercel projects found"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run again."
        exit 1
        ;;
esac

echo ""
echo "💡 Need help? Check SETUP_RAILWAY_VERCEL.md"
