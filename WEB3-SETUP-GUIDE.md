# Web3 Wallet Authentication Setup Guide

## 🚀 Web3 Login Integration Complete!

Your Maya Travel Agent now supports **cryptocurrency wallet authentication**!

---

## ✅ What Was Added

### 1. **Web3 Libraries**
- ✅ `wagmi` - React hooks for Ethereum
- ✅ `viem` - TypeScript Ethereum library
- ✅ `@web3modal/wagmi` - WalletConnect modal UI

### 2. **New Components**
- ✅ `Web3LoginButton` - Connect wallet button
- ✅ `lib/web3.ts` - Web3 configuration
- ✅ Integrated into Auth page

### 3. **Supported Wallets**
- 🦊 **MetaMask**
- 🌈 **Rainbow Wallet**
- 💼 **Coinbase Wallet**
- 🔗 **WalletConnect** (300+ wallets)
- 🔐 **Trust Wallet**
- 📱 **Ledger**
- And many more...

### 4. **Supported Networks**
- 🟢 **Ethereum Mainnet**
- 🟣 **Polygon**
- 🔵 **Arbitrum**
- 🔴 **Optimism**
- 🔷 **Base**

---

## 🔧 **Required: Get WalletConnect Project ID**

### **Step 1: Create WalletConnect Project**

1. Go to: https://cloud.walletconnect.com/
2. Sign up or log in
3. Click **"Create New Project"**
4. Fill in:
   - **Name:** Maya Travel Agent
   - **Homepage:** https://frontend-ntqdzspko-mohameds-projects-e3d02482.vercel.app
5. Click **"Create"**
6. Copy your **Project ID** (looks like: `a1b2c3d4e5f6...`)

### **Step 2: Add to Environment Variables**

#### **For Local Development:**
```bash
cd /Users/Shared/maya-travel-agent/frontend
echo "VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here" >> .env.local
```

#### **For Vercel Production:**
```bash
cd /Users/Shared/maya-travel-agent/frontend
echo "your_project_id_here" | vercel env add VITE_WALLETCONNECT_PROJECT_ID production
```

---

## 🎨 **How It Works**

### **User Flow:**

1. **User visits** `/auth` page
2. **Sees options:**
   - Email/Password login
   - Magic Link
   - **🆕 Connect Web3 Wallet** (new!)
3. **Clicks "Connect Web3 Wallet"**
4. **Modal opens** with wallet options
5. **User selects** their wallet (MetaMask, etc.)
6. **Signs message** to prove ownership
7. **Authenticated** and redirected to dashboard

### **Security:**

- ✅ **Signature-based auth** - User signs a message
- ✅ **No password needed** - Wallet signature is proof
- ✅ **Unique per wallet** - Each wallet address = unique user
- ✅ **Supabase integration** - Stored securely in database

---

## 📝 **Code Implementation**

### **App.tsx** (Main App)
```tsx
import { WagmiProvider } from 'wagmi';
import { config } from './lib/web3';

<WagmiProvider config={config}>
  {/* Your app content */}
</WagmiProvider>
```

### **Auth.tsx** (Login Page)
```tsx
import { Web3LoginButton } from '@/components/Auth/Web3LoginButton';

// Inside your auth form:
<Web3LoginButton onSuccess={() => navigate('/dashboard')} />
```

### **lib/web3.ts** (Configuration)
```tsx
import { createWeb3Modal } from '@web3modal/wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi'

// Configured with:
// - Multiple chains (Ethereum, Polygon, etc.)
// - WalletConnect integration
// - Metadata for your app
```

---

## 🧪 **Testing Web3 Login**

### **Local Testing:**

1. **Install MetaMask** browser extension
2. **Start dev server:**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Visit:** http://localhost:3000/auth
4. **Click** "Connect Web3 Wallet"
5. **Select** MetaMask
6. **Approve** connection
7. **Sign** the authentication message
8. **Redirected** to dashboard

### **Production Testing:**

1. **Visit:** https://frontend-ntqdzspko-mohameds-projects-e3d02482.vercel.app/auth
2. **Follow same steps** as local testing
3. **Works** on any device with a crypto wallet!

---

## 🔐 **Supabase Database Schema**

Web3 users are stored with:

```sql
-- User metadata includes:
{
  "wallet_address": "0x1234...5678",
  "auth_type": "web3",
  "email": "0x1234...5678@web3.maya.app"
}
```

**Email format:** `{wallet_address}@web3.maya.app`

This allows:
- ✅ Unique identification per wallet
- ✅ Integration with existing auth system
- ✅ Profile management
- ✅ Trip history tracking

---

## 📱 **Mobile Support**

Web3 login works on:
- ✅ **Desktop** - Browser extension wallets
- ✅ **Mobile** - WalletConnect QR code
- ✅ **In-app browsers** - Trust Wallet, Rainbow, etc.

### **Mobile Flow:**
1. User clicks "Connect Web3 Wallet"
2. QR code appears
3. Scan with mobile wallet app
4. Approve connection
5. Authenticated!

---

## 🎯 **Next Steps**

### **Required:**
1. ✅ Get WalletConnect Project ID from https://cloud.walletconnect.com/
2. ✅ Add `VITE_WALLETCONNECT_PROJECT_ID` to Vercel environment variables
3. ✅ Redeploy to Vercel

### **Optional Enhancements:**
1. **ENS Names** - Display ENS instead of addresses
2. **NFT Avatars** - Use NFT profile pictures
3. **Token Gating** - Require specific tokens for premium features
4. **Multi-chain** - Add more blockchain networks
5. **Wallet Portfolio** - Show user's crypto holdings

---

## 📋 **Commands Summary**

```bash
# Install dependencies
cd /Users/Shared/maya-travel-agent/frontend
npm install wagmi viem @web3modal/wagmi

# Add WalletConnect Project ID (get from cloud.walletconnect.com)
echo "your_project_id" | vercel env add VITE_WALLETCONNECT_PROJECT_ID production

# Build and test locally
npm run build:dev
npm run dev

# Deploy to Vercel
vercel --prod --yes
```

---

## 🌐 **Deployment URLs**

| Environment | URL |
|-------------|-----|
| **Production** | https://frontend-ntqdzspko-mohameds-projects-e3d02482.vercel.app |
| **Local** | http://localhost:3000 |

---

## 💡 **Pro Tips**

### **For Better UX:**
1. Show wallet balance in user profile
2. Add disconnect button in navbar
3. Display network/chain in header
4. Add wallet switching support
5. Show transaction history

### **For Security:**
1. Always verify signatures server-side
2. Use nonces to prevent replay attacks
3. Implement session expiration
4. Rate limit authentication attempts

---

## 🐛 **Troubleshooting**

### **"WalletConnect Project ID not found"**
- ✅ Add `VITE_WALLETCONNECT_PROJECT_ID` to environment variables
- Get ID from: https://cloud.walletconnect.com/

### **"No wallets detected"**
- ✅ Install MetaMask or another wallet extension
- ✅ Use WalletConnect QR code for mobile wallets

### **"Connection failed"**
- ✅ Check wallet is unlocked
- ✅ Verify network is supported
- ✅ Try refreshing the page

---

## 🎊 **Features Enabled**

✅ **Multi-Wallet Support** - MetaMask, WalletConnect, Coinbase, etc.  
✅ **Multi-Chain** - Ethereum, Polygon, Arbitrum, Optimism, Base  
✅ **Signature Auth** - Secure cryptographic authentication  
✅ **Mobile Friendly** - QR code support for mobile wallets  
✅ **Supabase Integration** - Seamless with existing auth  
✅ **User Profiles** - Wallet address stored in metadata  

---

## 📞 **Support**

For Web3 integration issues:
1. Check WalletConnect docs: https://docs.walletconnect.com/
2. Check wagmi docs: https://wagmi.sh/
3. Review browser console for errors
4. Check Supabase auth logs

---

**Status:** ✅ Web3 Login Ready for Deployment  
**Next Action:** Get WalletConnect Project ID and add to Vercel env vars

