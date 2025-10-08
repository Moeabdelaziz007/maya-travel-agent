import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, MapPin, Calendar, DollarSign, Plane } from 'lucide-react';
import { toast } from 'sonner';

interface Trip {
  id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  travelers_count: number;
  itinerary: any;
  preferences: any;
  trip_style: string | null;
  booking_status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast.error('Failed to load trips');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'text-secondary';
      case 'booked':
        return 'text-primary';
      case 'completed':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Journeys
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.email?.split('@')[0]}!
            </p>
          </div>
          <Link to="/planner">
            <Button className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>

        {trips.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <Plane className="w-16 h-16 mx-auto text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your next adventure!
            </p>
            <Link to="/planner">
              <Button className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Trip
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trip/${trip.id}`}>
                <Card className="glass-card p-6 hover:shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {trip.destination}
                    </h3>
                    <span className={`text-sm font-medium ${getStatusColor(trip.booking_status)}`}>
                      {trip.booking_status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    {trip.start_date && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(trip.start_date).toLocaleDateString()}
                          {trip.end_date && ` - ${new Date(trip.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.destination}</span>
                    </div>

                    {trip.budget && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>${trip.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
