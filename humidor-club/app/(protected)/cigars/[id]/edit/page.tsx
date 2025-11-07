'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Cigarette, Check, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Brand {
  id: string;
  name: string;
  country?: string;
}

interface Line {
  id: string;
  name: string;
}

interface Cigar {
  id: string;
  vitola: string;
  ring_gauge?: number | null;
  length_inches?: number | null;
  wrapper?: string | null;
  binder?: string | null;
  filler?: string | null;
  strength?: string | null;
  body?: string | null;
  msrp_cents?: number | null;
  country?: string | null;
  image_urls?: string | null;
  line?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    };
  };
}

const STRENGTH_OPTIONS = ['Mild', 'Medium-Mild', 'Medium', 'Medium-Full', 'Full'];
const BODY_OPTIONS = ['Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full'];

export default function EditCigarPage() {
  const router = useRouter();
  const params = useParams();
  const cigarId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);
  const [cigar, setCigar] = useState<Cigar | null>(null);

  // Form data
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [vitola, setVitola] = useState('');
  const [ringGauge, setRingGauge] = useState('');
  const [length, setLength] = useState('');
  const [wrapper, setWrapper] = useState('');
  const [binder, setBinder] = useState('');
  const [filler, setFiller] = useState('');
  const [strength, setStrength] = useState('Medium');
  const [body, setBody] = useState('Medium');
  const [price, setPrice] = useState('');
  const [country, setCountry] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cigar data
  useEffect(() => {
    fetchCigar();
    fetchBrands();
  }, [cigarId]);

  // Load lines when brand changes
  useEffect(() => {
    if (selectedBrand) {
      fetchLines(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchCigar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cigars/${cigarId}`);
      const data = await response.json();
      
      if (data.success && data.cigar) {
        setCigar(data.cigar);
        
        // Pre-fill form with existing data
        if (data.cigar.line) {
          setSelectedBrand(data.cigar.line.brand?.id || '');
          setSelectedLine(data.cigar.line.id);
        }
        setVitola(data.cigar.vitola || '');
        setRingGauge(data.cigar.ring_gauge?.toString() || '');
        setLength(data.cigar.length_inches?.toString() || '');
        setWrapper(data.cigar.wrapper || '');
        setBinder(data.cigar.binder || '');
        setFiller(data.cigar.filler || '');
        setStrength(data.cigar.strength || 'Medium');
        setBody(data.cigar.body || 'Medium');
        setPrice(data.cigar.msrp_cents ? (data.cigar.msrp_cents / 100).toFixed(2) : '');
        setCountry(data.cigar.country || '');
        
        // Parse existing images
        if (data.cigar.image_urls) {
          try {
            const parsed = JSON.parse(data.cigar.image_urls);
            setImages(Array.isArray(parsed) ? parsed : []);
          } catch {
            setImages([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cigar:', error);
      alert('Failed to load cigar data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchLines = async (brandId: string) => {
    setLoadingLines(true);
    try {
      const response = await fetch(`/api/lines?brandId=${encodeURIComponent(brandId)}`);
      const data = await response.json();
      if (data.success) {
        setLines(data.lines || []);
      }
    } catch (error) {
      console.error('Error fetching lines:', error);
    } finally {
      setLoadingLines(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', data.error);
          alert(`Failed to upload ${file.name}: ${data.error}`);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/cigars/${cigarId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line: selectedLine,
          vitola,
          ring_gauge: ringGauge ? parseInt(ringGauge) : undefined,
          length_inches: length ? parseFloat(length) : undefined,
          wrapper: wrapper || undefined,
          binder: binder || undefined,
          filler: filler || undefined,
          strength,
          body,
          msrp_cents: price ? Math.round(parseFloat(price) * 100) : undefined,
          country: country || undefined,
          image_urls: images.length > 0 ? images : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update cigar');
      }

      const data = await response.json();
      console.log('✅ Cigar updated successfully:', data);

      router.push('/cigars');
    } catch (error: any) {
      console.error('❌ Error updating cigar:', error);
      alert(`Failed to update cigar: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const canProceedStep1 = selectedBrand && selectedLine;
  const canProceedStep2 = vitola && ringGauge && length;
  const canSubmit = canProceedStep1 && canProceedStep2;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading cigar data...</p>
        </div>
      </div>
    );
  }

  if (!cigar) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cigar not found</p>
          <Link
            href="/cigars"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cigars
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
          <Link href="/cigars" className="p-2 -m-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Edit Cigar</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
          <Cigarette className="h-6 w-6 text-primary" />
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Step 1: Brand & Line - Same as add page */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Brand & Line</h2>

              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Brand *</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} {brand.country ? `(${brand.country})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Product Line *</label>
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  required
                  disabled={!selectedBrand || loadingLines}
                  className="w-full p-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">
                    {!selectedBrand
                      ? 'Select a brand first...'
                      : loadingLines
                        ? 'Loading lines...'
                        : 'Select a line...'}
                  </option>
                  {lines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Details
            </button>
          </div>
        )}

        {/* Step 2: Size & Details - Same as add page */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Cigar Details</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vitola (Shape) *</label>
                  <input
                    type="text"
                    value={vitola}
                    onChange={(e) => setVitola(e.target.value)}
                    required
                    placeholder="e.g., Robusto, Toro, Churchill"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ring Gauge *</label>
                    <input
                      type="number"
                      value={ringGauge}
                      onChange={(e) => setRingGauge(e.target.value)}
                      required
                      min="20"
                      max="100"
                      placeholder="50"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Length (inches) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      required
                      min="2"
                      max="12"
                      placeholder="6.0"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Country of Origin</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Nicaragua, Dominican Republic"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
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
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tobacco & Characteristics with Images - Same as add page */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Tobacco & Characteristics</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wrapper</label>
                  <input
                    type="text"
                    value={wrapper}
                    onChange={(e) => setWrapper(e.target.value)}
                    placeholder="e.g., Connecticut, Maduro, Habano"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Binder</label>
                  <input
                    type="text"
                    value={binder}
                    onChange={(e) => setBinder(e.target.value)}
                    placeholder="e.g., Nicaraguan"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filler</label>
                  <input
                    type="text"
                    value={filler}
                    onChange={(e) => setFiller(e.target.value)}
                    placeholder="e.g., Nicaraguan, Dominican"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Strength</label>
                    <select
                      value={strength}
                      onChange={(e) => setStrength(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {STRENGTH_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Body</label>
                    <select
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {BODY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">MSRP (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="12.50"
                    min="0"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Images</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                      uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">
                      {uploadingImages ? 'Uploading...' : 'Click to upload images (JPEG, PNG, WebP)'}
                    </span>
                  </label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {images.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border">
                            <Image
                              src={url}
                              alt={`Cigar image ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 border font-semibold py-3 px-4 rounded-lg hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

