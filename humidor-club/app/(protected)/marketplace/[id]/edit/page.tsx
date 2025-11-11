'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, X, Upload } from 'lucide-react';
import Image from 'next/image';

interface Listing {
  id: string;
  type: 'WTS' | 'WTB' | 'WTT';
  title: string;
  description: string;
  qty: number;
  condition: string | null;
  price_cents: number | null;
  currency: string;
  region: string | null;
  city: string | null;
  meet_up_only: boolean;
  will_ship: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'PENDING' | 'SOLD' | 'WITHDRAWN' | 'FROZEN';
  image_urls: string[];
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
  humidor_item_id?: string | null;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
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
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListing();
    } else {
      setError('Invalid listing ID');
      setLoading(false);
    }
  }, [listingId]);

  const fetchListing = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}`);
      const data = await response.json();

      if (data.success && data.listing) {
        const listingData = data.listing;
        setListing(listingData);
        
        // Pre-populate form fields
        setType(listingData.type);
        setTitle(listingData.title);
        setDescription(listingData.description);
        setQty(listingData.qty);
        setCondition(listingData.condition || '');
        setPriceCents(listingData.price_cents ? (listingData.price_cents / 100).toFixed(2) : '');
        setCurrency(listingData.currency || 'USD');
        setRegion(listingData.region || '');
        setCity(listingData.city || '');
        setMeetUpOnly(listingData.meet_up_only);
        setWillShip(listingData.will_ship);
        setImageUrls(listingData.image_urls || []);
        // Only allow DRAFT or ACTIVE status for editing
        // If listing is SOLD/WITHDRAWN/FROZEN, default to DRAFT
        if (listingData.status === 'ACTIVE' || listingData.status === 'DRAFT') {
          setStatus(listingData.status);
        } else {
          // For SOLD, WITHDRAWN, FROZEN, PENDING - default to DRAFT
          setStatus('DRAFT');
        }
      } else {
        setError(data.error || 'Failed to load listing');
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingId) return;

    try {
      setSaving(true);
      setError(null);

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
        image_urls: imageUrls.length > 0 
          ? imageUrls.filter(url => !url.startsWith('blob:')) // Filter out blob URLs (failed uploads)
          : undefined,
        status,
      };

      // Validate price for WTS
      if (type === 'WTS' && !priceCents) {
        setError('Price is required for "Want to Sell" listings');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to listing detail page
        router.push(`/marketplace/${listingId}`);
      } else {
        setError(data.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: string[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Upload to server
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadData = await uploadResponse.json();
        
        if (uploadData.success) {
          newImages.push(uploadData.url);
        } else {
          errors.push(`Failed to upload ${file.name}: ${uploadData.error}`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        errors.push(`Failed to upload ${file.name}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('. '));
    }

    if (newImages.length > 0) {
      setImageUrls([...imageUrls, ...newImages]);
    }

    setUploadingImages(false);
    
    // Reset file input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const canSubmit = title && description && qty > 0 && (type !== 'WTS' || priceCents);

  const getCigarName = () => {
    if (listing?.cigar) {
      const brandName = listing.cigar.line?.brand?.name || 'Unknown Brand';
      const lineName = listing.cigar.line?.name || 'Unknown Line';
      return `${brandName} ${lineName} - ${listing.cigar.vitola}`;
    }
    return listing?.title || 'Unknown Cigar';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href={`/marketplace/${listingId}`} className="p-2 -m-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Edit Listing</h1>
            <p className="text-sm text-muted-foreground">{getCigarName()}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Cigar Info (Read-only) */}
        {listing?.cigar && (
          <div className="bg-muted/50 border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Cigar</h3>
            <p className="text-sm text-muted-foreground">{getCigarName()}</p>
            <p className="text-xs text-muted-foreground mt-1">Cigar cannot be changed after listing creation</p>
          </div>
        )}

        {/* Status Warning */}
        {listing && listing.status !== 'ACTIVE' && listing.status !== 'DRAFT' && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Original Status: {listing.status}</p>
            <p className="text-xs mt-1">This listing was previously {listing.status.toLowerCase()}. You can reactivate it by publishing as ACTIVE or save as DRAFT.</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Listing Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Listing Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['WTS', 'WTB', 'WTT'] as const).map((listingType) => (
                <button
                  key={listingType}
                  type="button"
                  onClick={() => setType(listingType)}
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
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                required
                className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
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

          {/* Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Images</label>
            <div className="grid grid-cols-3 gap-4">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={url}
                    alt={`Listing image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-background/80 hover:bg-background rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {uploadingImages ? (
                  <div className="text-sm text-muted-foreground">Uploading...</div>
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
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

        <div className="flex gap-3">
          <Link
            href={`/marketplace/${listingId}`}
            className="flex-1 border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit || saving}
            className="flex-1 bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : status === 'ACTIVE' ? 'Update & Publish' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

