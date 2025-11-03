'use client';

import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HumidorItem {
  id: string;
  cigar_id: string;
  quantity: number;
  purchase_price_cents?: number | null;
  cigar?: {
    id: string;
    vitola: string;
    line?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  };
}

interface HumidorStats {
  totalCigars: number;
  uniqueCigars: number;
  totalValue: number;
  totalItems: number;
}

export default function HumidorPage() {
  const [items, setItems] = useState<HumidorItem[]>([]);
  const [stats, setStats] = useState<HumidorStats>({
    totalCigars: 0,
    uniqueCigars: 0,
    totalValue: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHumidor();
  }, []);

  const fetchHumidor = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/humidor');
      const data = await response.json();
      
      if (data.success) {
        setItems(data.items || []);
        setStats(data.stats || {
          totalCigars: 0,
          uniqueCigars: 0,
          totalValue: 0,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching humidor:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents?: number | null) => {
    if (!cents) return '$0';
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your humidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Humidor</h1>
          <p className="text-muted-foreground mt-2">
            Track your personal cigar collection
          </p>
        </div>
        <Link
          href="/cigars/add"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px]"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Add Cigar</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold mt-1">{stats.totalCigars}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Unique</p>
          <p className="text-2xl font-bold mt-1">{stats.uniqueCigars}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Value</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(stats.totalValue)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Items</p>
          <p className="text-2xl font-bold mt-1">{stats.totalItems}</p>
        </div>
      </div>

      {/* Items List or Empty State */}
      {items.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-full bg-muted inline-block">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Your humidor is empty</h3>
            <p className="text-muted-foreground">
              Start by adding cigars to track your collection, log tasting notes, and monitor your inventory.
            </p>
            <Link
              href="/cigars/add"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors min-h-[48px] mt-4"
            >
              <Plus className="h-5 w-5" />
              Add Your First Cigar
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Cigars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">
                      {item.cigar?.line?.brand?.name || 'Unknown'} {item.cigar?.line?.name || ''}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.cigar?.vitola || 'Unknown Vitola'}
                    </p>
                  </div>
                  {item.quantity > 1 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
                {item.purchase_price_cents && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Paid: {formatPrice(item.purchase_price_cents)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
