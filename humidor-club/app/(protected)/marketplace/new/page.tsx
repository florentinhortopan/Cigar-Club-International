'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Upload, DollarSign, Package, RefreshCw, Search } from 'lucide-react';
import Image from 'next/image';

interface HumidorItem {
  id: string;
  cigar_id: string;
  quantity: number;
  available_for_sale: number;
  available_for_trade: number;
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

interface Cigar {
  id: string;
  vitola: string;
  line?: {
    name: string;
    brand?: {
      name: string;
    };
  };
}

export default function CreateListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const humidorItemId = searchParams.get('humidor_item_id');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingHumidor, setLoadingHumidor] = useState(false);
  const [humidorItems, setHumidorItems] = useState<HumidorItem[]>([]);
  const [selectedHumidorItem, setSelectedHumidorItem] = useState<HumidorItem | null>(null);
  const [selectedCigar, setSelectedCigar] = useState<Cigar | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cigarSearchResults, setCigarSearchResults] = useState<Cigar[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Listing form fields
  const [type, setType] = useState<'WTS' | 'WTB' | 'WTT'>('WTS');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [qty, setQty] = useState(1);
  const [condition, setCondition] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [meetUpOnly, setMeetUpOnly] = useState(true);
  const [willShip, setWillShip] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT');

  useEffect(() => {
    if (humidorItemId) {
      fetchHumidorItems();
    }
  }, [humidorItemId]);

  useEffect(() => {
    if (selectedHumidorItem) {
      // Pre-fill form with humidor item data
      setQty(1);
      if (selectedHumidorItem.available_for_sale > 0) {
        setType('WTS');
        setQty(Math.min(selectedHumidorItem.available_for_sale, selectedHumidorItem.quantity));
      } else if (selectedHumidorItem.available_for_trade > 0) {
        setType('WTT');
        setQty(Math.min(selectedHumidorItem.available_for_trade, selectedHumidorItem.quantity));
      }
      if (selectedHumidorItem.cigar) {
        setSelectedCigar(selectedHumidorItem.cigar);
        setTitle(`${selectedHumidorItem.cigar.line?.brand?.name || ''} ${selectedHumidorItem.cigar.line?.name || ''} - ${selectedHumidorItem.cigar.vitola}`.trim());
      }
    }
  }, [selectedHumidorItem]);

  const fetchHumidorItems = async () => {
    try {
      setLoadingHumidor(true);
      const response = await fetch('/api/humidor');
      const data = await response.json();

      if (data.success) {
        const items = data.items.filter((item: HumidorItem) => 
          item.quantity > 0 && (item.available_for_sale > 0 || item.available_for_trade > 0)
        );
        setHumidorItems(items);

        // If humidor_item_id is provided, select that item
        if (humidorItemId) {
          const item = items.find((i: HumidorItem) => i.id === humidorItemId);
          if (item) {
            setSelectedHumidorItem(item);
            setStep(2); // Skip to step 2 if item is pre-selected
          }
        }
      }
    } catch (error) {
      console.error('Error fetching humidor items:', error);
    } finally {
      setLoadingHumidor(false);
    }
  };

  const searchCigars = async (query: string) => {
    if (!query || query.length < 2) {
      setCigarSearchResults([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const response = await fetch(`/api/cigars?search=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setCigarSearchResults(data.cigars || []);
      }
    } catch (error) {
      console.error('Error searching cigars:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchCigars(searchQuery);
      } else {
        setCigarSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const listingData: any = {
        type,
        title,
        description,
        qty: parseInt(qty.toString()),
        condition: condition || undefined,
        price_cents: priceCents ? Math.round(parseFloat(priceCents) * 100) : undefined,
        currency,
        region: region || undefined,
        city: city || undefined,
        meet_up_only: meetUpOnly,
        will_ship: willShip,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        status,
      };

      if (selectedHumidorItem) {
        listingData.humidor_item_id = selectedHumidorItem.id;
        listingData.cigar_id = selectedHumidorItem.cigar_id;
      } else if (selectedCigar) {
        listingData.cigar_id = selectedCigar.id;
      }

      // Validate price for WTS
      if (type === 'WTS' && !priceCents) {
        alert('Price is required for "Want to Sell" listings');
        setLoading(false);
        return;
      }

      // Validate quantity
      if (selectedHumidorItem) {
        const maxQty = type === 'WTS' 
          ? selectedHumidorItem.available_for_sale 
          : selectedHumidorItem.available_for_trade;
        
        if (qty > maxQty) {
          alert(`Quantity cannot exceed available quantity (${maxQty})`);
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to listing detail page or marketplace
        router.push(`/marketplace/${data.listing.id}`);
      } else {
        alert(data.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = selectedHumidorItem || selectedCigar;
  const canSubmit = title && description && qty > 0 && (type !== 'WTS' || priceCents);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href="/marketplace" className="p-2 -m-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Create Listing</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Step 1: Select Cigar */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Cigar</h2>
              
              {/* Option: From Humidor */}
              {humidorItemId && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">From My Humidor</h3>
                  {loadingHumidor ? (
                    <p className="text-sm text-muted-foreground">Loading humidor items...</p>
                  ) : humidorItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No items available for listing in your humidor.</p>
                  ) : (
                    <div className="space-y-2">
                      {humidorItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedHumidorItem(item);
                            setSelectedCigar(null);
                            setStep(2);
                          }}
                          className={`w-full text-left p-4 border rounded-lg transition-colors ${
                            selectedHumidorItem?.id === item.id
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {item.cigar?.line?.brand?.name || 'Unknown'} {item.cigar?.line?.name || ''}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.cigar?.vitola || 'Unknown Vitola'}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>Qty: {item.quantity}</span>
                                {item.available_for_sale > 0 && (
                                  <span className="text-green-600 dark:text-green-400">
                                    {item.available_for_sale} for sale
                                  </span>
                                )}
                                {item.available_for_trade > 0 && (
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {item.available_for_trade} for trade
                                  </span>
                                )}
                              </div>
                            </div>
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Option: Search for Cigar */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Or Search for a Cigar</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cigars..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {loadingSearch && (
                  <p className="text-sm text-muted-foreground">Searching...</p>
                )}

                {cigarSearchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                    {cigarSearchResults.map((cigar) => (
                      <button
                        key={cigar.id}
                        type="button"
                        onClick={() => {
                          setSelectedCigar(cigar);
                          setSelectedHumidorItem(null);
                          setTitle(`${cigar.line?.brand?.name || ''} ${cigar.line?.name || ''} - ${cigar.vitola}`.trim());
                          setStep(2);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedCigar?.id === cigar.id
                            ? 'bg-primary/10 border border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <p className="font-medium">
                          {cigar.line?.brand?.name || 'Unknown'} {cigar.line?.name || ''}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {cigar.vitola || 'Unknown Vitola'}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Listing Details
            </button>
          </div>
        )}

        {/* Step 2: Listing Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Listing Details</h2>

              <div className="space-y-4">
                {/* Listing Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Listing Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['WTS', 'WTB', 'WTT'] as const).map((listingType) => (
                      <button
                        key={listingType}
                        type="button"
                        onClick={() => {
                          setType(listingType);
                          if (listingType === 'WTS' && selectedHumidorItem) {
                            setQty(Math.min(selectedHumidorItem.available_for_sale || 0, selectedHumidorItem.quantity));
                          } else if (listingType === 'WTT' && selectedHumidorItem) {
                            setQty(Math.min(selectedHumidorItem.available_for_trade || 0, selectedHumidorItem.quantity));
                          }
                        }}
                        className={`p-3 rounded-lg border font-medium transition-colors ${
                          type === listingType
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {listingType === 'WTS' && 'Sell'}
                        {listingType === 'WTB' && 'Buy'}
                        {listingType === 'WTT' && 'Trade'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Padron 1926 #9 - Box of 24"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe the cigars, condition, storage, etc."
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Quantity and Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity *</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        if (selectedHumidorItem) {
                          const maxQty = type === 'WTS'
                            ? selectedHumidorItem.available_for_sale || 0
                            : selectedHumidorItem.available_for_trade || 0;
                          setQty(Math.min(Math.max(1, val), maxQty));
                        } else {
                          setQty(Math.max(1, val));
                        }
                      }}
                      min="1"
                      max={selectedHumidorItem 
                        ? (type === 'WTS' ? selectedHumidorItem.available_for_sale : selectedHumidorItem.available_for_trade)
                        : undefined}
                      required
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {selectedHumidorItem && (
                      <p className="text-xs text-muted-foreground">
                        Max: {type === 'WTS' ? selectedHumidorItem.available_for_sale : selectedHumidorItem.available_for_trade}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Condition</label>
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="e.g., Mint, Excellent, Good"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Price (for WTS and WTT) */}
                {(type === 'WTS' || type === 'WTT') && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Price {type === 'WTS' && '*'}
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={priceCents}
                        onChange={(e) => setPriceCents(e.target.value)}
                        required={type === 'WTS'}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full pl-10 pr-3 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {type === 'WTS' ? 'Required for sale listings' : 'Optional - asking price for trade'}
                    </p>
                  </div>
                )}

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region/State</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., California, NY"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Los Angeles"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Shipping Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Shipping Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={meetUpOnly}
                        onChange={(e) => {
                          setMeetUpOnly(e.target.checked);
                          if (e.target.checked) {
                            setWillShip(false);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Meet up only (local exchange)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={willShip}
                        onChange={(e) => {
                          setWillShip(e.target.checked);
                          if (e.target.checked) {
                            setMeetUpOnly(false);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Willing to ship</span>
                    </label>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Listing Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['DRAFT', 'ACTIVE'] as const).map((listingStatus) => (
                      <button
                        key={listingStatus}
                        type="button"
                        onClick={() => setStatus(listingStatus)}
                        className={`p-3 rounded-lg border font-medium transition-colors ${
                          status === listingStatus
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {listingStatus === 'DRAFT' ? 'Save as Draft' : 'Publish Now'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : status === 'ACTIVE' ? 'Publish Listing' : 'Save Draft'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

