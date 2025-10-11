# 🧪 Amrikyy - Laptop-Friendly Setup

**No Docker, no complex tools - just run on your laptop!**

---

## ✅ Prerequisites

- **Node.js 18+** (check with `node -v`)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

---

## 🚀 Quick Start (2 minutes)

### Step 1: Run the test
```bash
cd /Users/Shared/maya-travel-agent
./test-laptop.sh
```

### Step 2: Run locally
```bash
cd /Users/Shared/maya-travel-agent
./run-local.sh
```

### Step 3: Open browser
```
http://localhost:3000
```

**That's it! 🎉**

---

## 📁 Project Structure

```
/Users/Shared/maya-travel-agent/
├── frontend/          # React + Vite (port 3000)
├── backend/           # Node.js + Express (port 5000)
├── run-local.sh       # Start everything locally
├── test-laptop.sh     # Test if everything works
└── deploy-*.sh        # Deploy to cloud (optional)
```

---

## 🔧 Manual Setup (if scripts don't work)

### Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### Start Services
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🌐 What You'll See

- **Frontend**: http://localhost:3000
  - React app with travel assistant UI
  - Responsive design, works on mobile

- **Backend**: http://localhost:5000
  - API server with AI integration
  - Health check: http://localhost:5000/health

---

## 🛠️ Troubleshooting

### "npm install" fails?
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Port 3000/5000 already in use?
```bash
# Kill processes on those ports
lsof -ti:3000,5000 | xargs kill -9

# Or use different ports
cd frontend && npm run dev -- --port 3001
cd backend && PORT=5001 npm run dev
```

### Node.js version too old?
```bash
# Install Node.js 18+ from https://nodejs.org
node -v  # Should show v18.x.x or higher
```

---

## 📊 Features That Work Locally

- ✅ **Frontend UI** - Full React app
- ✅ **Authentication** - Supabase integration
- ✅ **AI Chat** - Z.ai GLM-4.6 (needs API key)
- ✅ **Trip Planning** - Core functionality
- ✅ **Budget Tracking** - Expense management
- ✅ **Destinations** - Browse travel spots

---

## 🔑 Environment Variables (Optional)

Create `.env` files for full functionality:

### Frontend (.env)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
```

### Backend (.env)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ZAI_API_KEY=your_zai_api_key
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=your_secret_here
```

---

## 🚀 Deploy to Cloud (Optional)

When ready to deploy live:

```bash
# Deploy backend to Railway
./deploy-backend.sh

# Deploy frontend to Vercel
./deploy-frontend.sh
```

---

## 💡 Tips

- **Fast startup**: Use `./run-local.sh` (starts both services)
- **Debug mode**: Check logs in `frontend.log` and `backend.log`
- **Clean restart**: Run `./cleanup-system.sh` if things get slow
- **Update code**: Pull latest changes and run `npm install` again

---

**Enjoy Amrikyy on your laptop! 🎒**

