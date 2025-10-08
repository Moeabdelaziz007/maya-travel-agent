import { createWeb3Modal } from '@web3modal/wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { mainnet, polygon, arbitrum, optimism, base } from 'viem/chains'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Create wagmiConfig
const metadata = {
  name: 'Maya Travel Agent',
  description: 'AI-powered travel planning with blockchain authentication',
  url: 'https://frontend-ntqdzspko-mohameds-projects-e3d02482.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, polygon, arbitrum, optimism, base] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create modal
export const web3Modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true
})

