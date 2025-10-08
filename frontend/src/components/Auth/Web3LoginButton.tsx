import { useEffect, useState } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Web3LoginButtonProps {
  onSuccess?: () => void;
}

export const Web3LoginButton = ({ onSuccess }: Web3LoginButtonProps) => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (isConnected && address && !isAuthenticating) {
      handleWeb3Auth();
    }
  }, [isConnected, address]);

  const handleWeb3Auth = async () => {
    if (!address) return;

    setIsAuthenticating(true);
    try {
      // Create a nonce for the user to sign
      const nonce = `Sign this message to authenticate with Maya Travel Agent.\n\nWallet: ${address}\nNonce: ${Date.now()}`;

      // Request signature
      const signature = await signMessageAsync({ message: nonce });

      // Verify signature and create/login user with Supabase
      // Note: You'll need to implement server-side verification
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${address.toLowerCase()}@web3.maya.app`,
        password: signature.slice(0, 32), // Use part of signature as password
      });

      if (error) {
        // If user doesn't exist, create account
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${address.toLowerCase()}@web3.maya.app`,
          password: signature.slice(0, 32),
          options: {
            data: {
              wallet_address: address,
              auth_type: 'web3',
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }
      }

      toast.success('Connected with Web3 wallet!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Web3 auth error:', error);
      toast.error(error.message || 'Failed to authenticate with Web3');
      disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    supabase.auth.signOut();
    toast.info('Disconnected from Web3 wallet');
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        className="w-full"
        disabled={isAuthenticating}
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isAuthenticating ? 'Authenticating...' : `${address.slice(0, 6)}...${address.slice(-4)}`}
        <LogOut className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        // Open Web3Modal
        if (window.web3Modal) {
          window.web3Modal.open();
        }
      }}
      variant="outline"
      className="w-full border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Web3 Wallet
    </Button>
  );
};

// Extend window type for web3Modal
declare global {
  interface Window {
    web3Modal?: any;
  }
}

