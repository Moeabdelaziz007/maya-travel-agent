import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const SUBSCRIPTION_TIERS = {
  free: {
    price_id: 'price_1RGGqy04ZrRRGSg5XlFr92lZ', // Replace with actual free tier price ID
    product_id: 'prod_RqFkpSANdQOugO', // Replace with actual free tier product ID
    name: 'Free Plan',
    price: '$0',
  },
};

export function SubscriptionCard() {
  const { subscribed, productId, subscriptionEnd, loading, refreshSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: SUBSCRIPTION_TIERS.free.price_id }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open customer portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
        <CardDescription>
          {subscribed ? 'You have an active subscription' : 'Subscribe to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscribed ? (
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Plan:</strong> {SUBSCRIPTION_TIERS.free.name}
            </p>
            {subscriptionEnd && (
              <p className="text-sm">
                <strong>Renews:</strong> {new Date(subscriptionEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">{SUBSCRIPTION_TIERS.free.name}</h3>
              <p className="text-2xl font-bold mt-2">{SUBSCRIPTION_TIERS.free.price}<span className="text-sm font-normal">/month</span></p>
              <p className="text-sm text-muted-foreground mt-2">AI-powered trip planning</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {subscribed ? (
          <>
            <Button 
              onClick={handleManageSubscription} 
              disabled={portalLoading}
              variant="outline"
            >
              {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Manage Subscription
            </Button>
            <Button onClick={refreshSubscription} variant="secondary">
              Refresh Status
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleCheckout} 
            disabled={checkoutLoading}
            className="w-full"
          >
            {checkoutLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Subscribe Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
