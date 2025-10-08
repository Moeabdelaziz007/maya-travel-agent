import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIChat } from '@/components/AIChat';
import { toast } from 'sonner';
import { Calendar, MapPin, DollarSign, Sparkles, Plus, X } from 'lucide-react';

export default function TripPlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [destinations, setDestinations] = useState<string[]>(['']);

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const updateDestination = (index: number, value: string) => {
    const updated = [...destinations];
    updated[index] = value;
    setDestinations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const filteredDestinations = destinations.filter(d => d.trim() !== '');

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          destination: filteredDestinations[0] || title,
          start_date: startDate || null,
          end_date: endDate || null,
          budget: budget ? parseFloat(budget) : null,
          travelers_count: 1,
          booking_status: 'planning'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Trip created successfully!');
      navigate(`/trip/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create trip');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Plan Your Journey
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a new trip and let AI help you plan every detail
          </p>
        </div>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 glass">
            <TabsTrigger value="form">Manual Planning</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <AIChat />
          </TabsContent>

          <TabsContent value="form">

        <Card className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Trip Title
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer Adventure in Europe"
                required
                className="glass border-primary/30 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="glass border-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="glass border-primary/30 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget (USD)
              </Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="5000"
                className="glass border-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destinations
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDestination}
                  className="glass border-accent/30 hover:border-accent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {destinations.map((dest, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={dest}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    placeholder="Paris, France"
                    className="glass border-primary/30 focus:border-primary"
                  />
                  {destinations.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDestination(index)}
                      className="hover:bg-destructive/20 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1 glass border-primary/30 hover:border-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-glow"
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
