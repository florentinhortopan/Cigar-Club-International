'use client';

import Link from 'next/link';
import { Package, Plus, Flame, Calendar, TrendingUp, Tag, DollarSign, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HumidorItem {
  id: string;
  cigar_id: string;
  quantity: number;
  smoked_count: number;
  last_smoked_date?: string | null;
  purchase_price_cents?: number | null;
  available_for_sale?: number;
  available_for_trade?: number;
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
  totalSmoked: number;
  uniqueCigars: number;
  totalValue: number;
  totalItems: number;
}

export default function HumidorPage() {
  const [items, setItems] = useState<HumidorItem[]>([]);
  const [stats, setStats] = useState<HumidorStats>({
    totalCigars: 0,
    totalSmoked: 0,
    uniqueCigars: 0,
    totalValue: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [smokingItems, setSmokingItems] = useState<Set<string>>(new Set());
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [marketplaceQuantities, setMarketplaceQuantities] = useState<Record<string, { sale: number; trade: number }>>({});

  useEffect(() => {
    fetchHumidor();
  }, []);

  const fetchHumidor = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/humidor');
      const data = await response.json();
      
      if (data.success) {
        const fetchedItems = data.items || [];
        setItems(fetchedItems);
        setStats(data.stats || {
          totalCigars: 0,
          totalSmoked: 0,
          uniqueCigars: 0,
          totalValue: 0,
          totalItems: 0,
        });
        // Initialize marketplace quantities
        const quantities: Record<string, { sale: number; trade: number }> = {};
        fetchedItems.forEach((item: HumidorItem) => {
          quantities[item.id] = {
            sale: item.available_for_sale || 0,
            trade: item.available_for_trade || 0,
          };
        });
        setMarketplaceQuantities(quantities);
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleSmoke = async (itemId: string, count: number = 1) => {
    setSmokingItems(prev => new Set(prev).add(itemId));

    try {
      const response = await fetch('/api/humidor/smoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          count: count,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the humidor data
        await fetchHumidor();
      } else {
        alert(data.error || 'Failed to mark cigar as smoked');
      }
    } catch (error) {
      console.error('Error marking cigar as smoked:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSmokingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleUpdateMarketplace = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const quantities = marketplaceQuantities[itemId];
      if (!quantities) {
        alert('Invalid item');
        return;
      }

      const response = await fetch(`/api/humidor/${itemId}/marketplace`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available_for_sale: quantities.sale,
          available_for_trade: quantities.trade,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh the humidor data
        await fetchHumidor();
        // Collapse the expanded item
        setExpandedItems(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        alert(data.error || 'Failed to update marketplace status');
      }
    } catch (error) {
      console.error('Error updating marketplace status:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const toggleMarketplace = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const updateMarketplaceQuantity = (itemId: string, type: 'sale' | 'trade', value: number) => {
    setMarketplaceQuantities(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [type]: Math.max(0, value),
      },
    }));
  };

  // Get activity summary (recently smoked cigars)
  const getActivitySummary = () => {
    const itemsWithSmoking = items
      .filter(item => item.smoked_count > 0)
      .sort((a, b) => {
        if (!a.last_smoked_date) return 1;
        if (!b.last_smoked_date) return -1;
        return new Date(b.last_smoked_date).getTime() - new Date(a.last_smoked_date).getTime();
      })
      .slice(0, 10); // Last 10 smoking activities

    return itemsWithSmoking;
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold mt-1">{stats.totalCigars}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Smoked</p>
          <p className="text-2xl font-bold mt-1 text-primary">{stats.totalSmoked}</p>
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
            {items
              .filter(item => item.quantity > 0) // Only show items with remaining cigars
              .map((item) => {
                const availableQuantity = item.quantity - item.smoked_count;
                const isExpanded = expandedItems.has(item.id);
                const quantities = marketplaceQuantities[item.id] || { sale: item.available_for_sale || 0, trade: item.available_for_trade || 0 };
                const hasMarketplaceActivity = (item.available_for_sale || 0) > 0 || (item.available_for_trade || 0) > 0;
                // Allow listing if there's available quantity (don't require marketplace quantities to be set)
                const canCreateListing = availableQuantity > 0;

                return (
              <div key={item.id} className="bg-card border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {item.cigar?.line?.brand?.name || 'Unknown'} {item.cigar?.line?.name || ''}
                      </h3>
                      {hasMarketplaceActivity && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                          <Tag className="h-3 w-3" />
                          Marketplace
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.cigar?.vitola || 'Unknown Vitola'}
                    </p>
                  </div>
                </div>

                {/* Quantity and Smoking Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Remaining: </span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                    {item.smoked_count > 0 && (
                      <div className="flex items-center gap-1 text-primary">
                        <Flame className="h-4 w-4" />
                        <span>{item.smoked_count} smoked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marketplace Availability */}
                {(item.available_for_sale || 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <DollarSign className="h-3 w-3" />
                    <span>{item.available_for_sale} available for sale</span>
                  </div>
                )}
                {(item.available_for_trade || 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <RefreshCw className="h-3 w-3" />
                    <span>{item.available_for_trade} available for trade</span>
                  </div>
                )}

                {/* Last Smoked Date */}
                {item.last_smoked_date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Last smoked: {formatDate(item.last_smoked_date)}</span>
                  </div>
                )}

                {/* Purchase Info */}
                {item.purchase_price_cents && (
                  <p className="text-sm text-muted-foreground">
                    Paid: {formatPrice(item.purchase_price_cents)}
                  </p>
                )}

                {/* Marketplace Section */}
                {isExpanded && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-3 border-t">
                    <p className="text-xs font-medium text-muted-foreground">
                      Available: {availableQuantity} cigars
                    </p>
                    
                    {/* Sale Quantity */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Available for Sale
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={availableQuantity}
                        value={quantities.sale}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const maxSale = availableQuantity - quantities.trade;
                          updateMarketplaceQuantity(item.id, 'sale', Math.min(val, maxSale));
                        }}
                        className="w-full px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                    </div>

                    {/* Trade Quantity */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Available for Trade
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={availableQuantity}
                        value={quantities.trade}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const maxTrade = availableQuantity - quantities.sale;
                          updateMarketplaceQuantity(item.id, 'trade', Math.min(val, maxTrade));
                        }}
                        className="w-full px-2 py-1 text-sm rounded border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                    </div>

                    {/* Update Button */}
                    <button
                      onClick={() => handleUpdateMarketplace(item.id)}
                      disabled={updatingItems.has(item.id)}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {updatingItems.has(item.id) ? 'Updating...' : 'Update Availability'}
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSmoke(item.id, 1)}
                      disabled={smokingItems.has(item.id) || item.quantity === 0}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Flame className="h-4 w-4" />
                      {smokingItems.has(item.id) ? 'Smoking...' : 'Smoke 1'}
                    </button>
                    {item.quantity > 1 && (
                      <button
                        onClick={() => handleSmoke(item.id, item.quantity)}
                        disabled={smokingItems.has(item.id)}
                        className="flex items-center justify-center gap-2 border hover:bg-muted font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        title="Smoke all remaining"
                      >
                        <Flame className="h-4 w-4" />
                        All
                      </button>
                    )}
                  </div>
                  
                  {/* Marketplace Toggle and Create Listing */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleMarketplace(item.id)}
                      className="flex-1 flex items-center justify-center gap-2 border hover:bg-muted font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      <Tag className="h-4 w-4" />
                      {isExpanded ? 'Hide' : 'Marketplace'}
                    </button>
                    {canCreateListing && (
                      <Link
                        href={`/marketplace/new?humidor_item_id=${item.id}`}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        List
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      {getActivitySummary().length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Smoking Activity</h2>
          </div>
          <div className="space-y-3">
            {getActivitySummary().map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">
                    {item.cigar?.line?.brand?.name || 'Unknown'} {item.cigar?.line?.name || ''} - {item.cigar?.vitola || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {item.smoked_count} smoked
                    </span>
                    {item.last_smoked_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.last_smoked_date)}
                      </span>
                    )}
                  </div>
                </div>
                {item.quantity > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {item.quantity} remaining
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
