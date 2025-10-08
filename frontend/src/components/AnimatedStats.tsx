import { useEffect, useState } from 'react';
import { Users, Globe, Star, MapPin } from 'lucide-react';

interface StatProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

const StatCard = ({ icon, value, label, suffix = '' }: StatProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-card p-6 text-center hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-500">
      <div className="flex justify-center mb-3">{icon}</div>
      <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

export const AnimatedStats = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
      <StatCard
        icon={<Users className="w-8 h-8 text-primary" />}
        value={50000}
        suffix="+"
        label="Happy Travelers"
      />
      <StatCard
        icon={<Globe className="w-8 h-8 text-secondary" />}
        value={195}
        label="Countries Covered"
      />
      <StatCard
        icon={<MapPin className="w-8 h-8 text-accent" />}
        value={10000}
        suffix="+"
        label="Destinations"
      />
      <StatCard
        icon={<Star className="w-8 h-8 text-primary" />}
        value={98}
        suffix="%"
        label="Satisfaction Rate"
      />
    </div>
  );
};
