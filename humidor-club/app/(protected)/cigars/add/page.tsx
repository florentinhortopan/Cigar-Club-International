'use client';

import { useState, useEffect, useRef, type MutableRefObject } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cigarette, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
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

const STRENGTH_OPTIONS = ['Mild', 'Medium-Mild', 'Medium', 'Medium-Full', 'Full'];
const BODY_OPTIONS = ['Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full'];

interface AutocompleteOption {
  id?: string;
  label: string;
  description?: string;
}

export default function AddCigarPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLines, setLoadingLines] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [selectedLineId, setSelectedLineId] = useState('');
  const [lineInput, setLineInput] = useState('');

  // Form data
  const [brandSuggestions, setBrandSuggestions] = useState<AutocompleteOption[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const brandSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [creatingBrand, setCreatingBrand] = useState(false);

  const [lineSuggestions, setLineSuggestions] = useState<AutocompleteOption[]>([]);
  const [showLineSuggestions, setShowLineSuggestions] = useState(false);
  const lineSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [creatingLine, setCreatingLine] = useState(false);

  const [vitola, setVitola] = useState('');
  const [vitolaSuggestions, setVitolaSuggestions] = useState<string[]>([]);
  const [showVitolaSuggestions, setShowVitolaSuggestions] = useState(false);
  const vitolaSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [ringGauge, setRingGauge] = useState('');
  const [length, setLength] = useState('');
  const [wrapper, setWrapper] = useState('');
  const [wrapperSuggestions, setWrapperSuggestions] = useState<string[]>([]);
  const [showWrapperSuggestions, setShowWrapperSuggestions] = useState(false);
  const wrapperSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [binder, setBinder] = useState('');
  const [binderSuggestions, setBinderSuggestions] = useState<string[]>([]);
  const [showBinderSuggestions, setShowBinderSuggestions] = useState(false);
  const binderSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [filler, setFiller] = useState('');
  const [fillerSuggestions, setFillerSuggestions] = useState<string[]>([]);
  const [showFillerSuggestions, setShowFillerSuggestions] = useState(false);
  const fillerSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [strength, setStrength] = useState('Medium');
  const [body, setBody] = useState('Medium');
  const [price, setPrice] = useState('');
  const [country, setCountry] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countrySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const refs = [
      brandSearchTimeoutRef,
      lineSearchTimeoutRef,
      vitolaSearchTimeoutRef,
      countrySearchTimeoutRef,
      wrapperSearchTimeoutRef,
      binderSearchTimeoutRef,
      fillerSearchTimeoutRef,
    ];

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      });
    };
  }, []);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [addToHumidor, setAddToHumidor] = useState(true); // Default to true for convenience
  const [humidorQuantity, setHumidorQuantity] = useState('1'); // Quantity to add to humidor
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial brand suggestions
  useEffect(() => {
    fetchBrandSuggestions();
  }, []);

  // Load lines when brand is selected
  useEffect(() => {
    if (selectedBrandId) {
      fetchLineSuggestions(selectedBrandId);
    } else {
      setLineSuggestions([]);
      setSelectedLineId('');
      setLineInput('');
    }
  }, [selectedBrandId]);

  const fetchBrandSuggestions = async (query: string = '') => {
    try {
      const url = query
        ? `/api/brands?search=${encodeURIComponent(query)}`
        : '/api/brands';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load brands');
      }

      const options: AutocompleteOption[] = (data.brands || []).map((brand: Brand) => ({
        id: brand.id,
        label: brand.name,
        description: brand.country ? `Country: ${brand.country}` : undefined,
      }));

      setBrandSuggestions(options);
      if (query) {
        setShowBrandSuggestions(true);
      }
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
    }
  };

  const fetchLineSuggestions = async (brandId: string, query: string = '') => {
    setLoadingLines(true);
    try {
      const url = `/api/lines?brandId=${encodeURIComponent(brandId)}${
        query ? `&search=${encodeURIComponent(query)}` : ''
      }`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load lines');
      }

      const options: AutocompleteOption[] = (data.lines || []).map((line: Line) => ({
        id: line.id,
        label: line.name,
      }));

      setLineSuggestions(options);
      if (query) {
        setShowLineSuggestions(true);
      }
    } catch (error) {
      console.error('❌ Error fetching lines:', error);
    } finally {
      setLoadingLines(false);
    }
  };

  const fetchCigarFieldSuggestions = async (field: string, query: string) => {
    try {
      const url = `/api/cigars/suggestions?field=${encodeURIComponent(field)}${
        query ? `&search=${encodeURIComponent(query)}` : ''
      }`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch suggestions');
      }
      return (data.suggestions || []) as string[];
    } catch (error) {
      console.error(`❌ Error fetching ${field} suggestions:`, error);
      return [];
    }
  };

  const debounceFieldSuggestions = (
    field: string,
    value: string,
    setter: (value: string) => void,
    setSuggestions: (options: string[]) => void,
    setShow: (open: boolean) => void,
    timeoutRef: MutableRefObject<NodeJS.Timeout | null>
  ) => {
    setter(value);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      const results = await fetchCigarFieldSuggestions(field, value);
      setSuggestions(results);
      setShow(true);
    }, 200);
  };

  const handleBrandInputChange = (value: string) => {
    setBrandInput(value);
    setSelectedBrandId('');
    if (brandSearchTimeoutRef.current) {
      clearTimeout(brandSearchTimeoutRef.current);
    }
    brandSearchTimeoutRef.current = setTimeout(() => {
      fetchBrandSuggestions(value);
    }, 200);
    setShowBrandSuggestions(true);
  };

  const handleSelectBrand = (option: AutocompleteOption) => {
    if (!option.id) return;
    setSelectedBrandId(option.id);
    setBrandInput(option.label);
    setShowBrandSuggestions(false);
    setSelectedLineId('');
    setLineInput('');
    fetchLineSuggestions(option.id);
  };

  const handleCreateBrand = async (name: string) => {
    if (!name.trim() || creatingBrand) return;
    try {
      setCreatingBrand(true);
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create brand');
      }

      const brand: Brand = data.brand;
      setBrandSuggestions((prev) => [
        {
          id: brand.id,
          label: brand.name,
          description: brand.country ? `Country: ${brand.country}` : undefined,
        },
        ...prev,
      ]);
      setSelectedBrandId(brand.id);
      setBrandInput(brand.name);
      setShowBrandSuggestions(false);
      setSelectedLineId('');
      setLineInput('');
      fetchLineSuggestions(brand.id);
    } catch (error) {
      console.error('❌ Error creating brand:', error);
      alert(error instanceof Error ? error.message : 'Failed to create brand');
    } finally {
      setCreatingBrand(false);
    }
  };

  const handleLineInputChange = (value: string) => {
    setLineInput(value);
    setSelectedLineId('');
    if (!selectedBrandId) {
      setShowLineSuggestions(false);
      return;
    }
    if (lineSearchTimeoutRef.current) {
      clearTimeout(lineSearchTimeoutRef.current);
    }
    lineSearchTimeoutRef.current = setTimeout(() => {
      fetchLineSuggestions(selectedBrandId, value);
    }, 200);
    setShowLineSuggestions(true);
  };

  const handleSelectLine = (option: AutocompleteOption) => {
    if (!option.id) return;
    setSelectedLineId(option.id);
    setLineInput(option.label);
    setShowLineSuggestions(false);
  };

  const handleCreateLine = async (name: string) => {
    if (!selectedBrandId) {
      alert('Select or create a brand before adding a line.');
      return;
    }
    if (!name.trim() || creatingLine) return;
    try {
      setCreatingLine(true);
      const response = await fetch('/api/lines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brandId: selectedBrandId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create line');
      }

      const line: Line = data.line;
      setLineSuggestions((prev) => [
        { id: line.id, label: line.name },
        ...prev,
      ]);
      setSelectedLineId(line.id);
      setLineInput(line.name);
      setShowLineSuggestions(false);
    } catch (error) {
      console.error('❌ Error creating line:', error);
      alert(error instanceof Error ? error.message : 'Failed to create line');
    } finally {
      setCreatingLine(false);
    }
  };

  const handleVitolaChange = (value: string) =>
    debounceFieldSuggestions(
      'vitola',
      value,
      setVitola,
      setVitolaSuggestions,
      setShowVitolaSuggestions,
      vitolaSearchTimeoutRef
    );

  const handleCountryChange = (value: string) =>
    debounceFieldSuggestions(
      'country',
      value,
      setCountry,
      setCountrySuggestions,
      setShowCountrySuggestions,
      countrySearchTimeoutRef
    );

  const handleWrapperChange = (value: string) =>
    debounceFieldSuggestions(
      'wrapper',
      value,
      setWrapper,
      setWrapperSuggestions,
      setShowWrapperSuggestions,
      wrapperSearchTimeoutRef
    );

  const handleBinderChange = (value: string) =>
    debounceFieldSuggestions(
      'binder',
      value,
      setBinder,
      setBinderSuggestions,
      setShowBinderSuggestions,
      binderSearchTimeoutRef
    );

  const handleFillerChange = (value: string) =>
    debounceFieldSuggestions(
      'filler',
      value,
      setFiller,
      setFillerSuggestions,
      setShowFillerSuggestions,
      fillerSearchTimeoutRef
    );

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
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requestData = {
      line: selectedLineId,
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
      add_to_humidor: addToHumidor, // Flag to add to humidor
      humidor_quantity: addToHumidor ? parseInt(humidorQuantity) || 1 : undefined, // Quantity to add
    };

    console.log('📤 Submitting cigar data:', {
      ...requestData,
      image_urls: requestData.image_urls ? `${requestData.image_urls.length} images` : 'none',
    });

    try {
      const response = await fetch('/api/cigars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Response status:', response.status);
      const responseText = await response.text();
      console.log('📡 Response body:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Failed to create cigar' };
        }
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create cigar');
      }

      const data = JSON.parse(responseText);
      console.log('✅ Cigar created successfully:', data);

      // Optionally: Automatically add to humidor after creating
      // For now, just redirect - user can add to humidor separately
      // Redirect to cigars page to see the new cigar
      router.push('/cigars');
    } catch (error: any) {
      console.error('❌ Error creating cigar:', error);
      alert(`Failed to create cigar: ${error.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = Boolean(selectedBrandId && selectedLineId);
  const canProceedStep2 = vitola && ringGauge && length;
  const canSubmit = canProceedStep1 && canProceedStep2;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href="/cigars" className="p-2 -m-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Add New Cigar</h1>
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
        {/* Step 1: Brand & Line */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Select Brand & Line</h2>

              {/* Brand Selection */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Brand *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => handleBrandInputChange(e.target.value)}
                    onFocus={() => {
                      setShowBrandSuggestions(true);
                      if (!brandInput) {
                        fetchBrandSuggestions();
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 150)}
                    required
                    placeholder="Search or add a brand..."
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {showBrandSuggestions && (
                    <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                      {brandSuggestions.length > 0 ? (
                        <div className="py-1">
                          {brandSuggestions.map((option) => (
                            <button
                              key={option.id ?? option.label}
                              type="button"
                              className="flex w-full flex-col items-start gap-1 px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => handleSelectBrand(option)}
                            >
                              <span className="font-medium">{option.label}</span>
                              {option.description && (
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No brands found. Add a new one below.
                        </p>
                      )}
                      {brandInput && (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10"
                          onMouseDown={() => handleCreateBrand(brandInput)}
                          disabled={creatingBrand}
                        >
                          {creatingBrand ? 'Creating brand...' : `Add "${brandInput}" as a new brand`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Line Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Line *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={lineInput}
                    onChange={(e) => handleLineInputChange(e.target.value)}
                    onFocus={() => {
                      if (selectedBrandId) {
                        setShowLineSuggestions(true);
                        fetchLineSuggestions(selectedBrandId);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowLineSuggestions(false), 150)}
                    required
                    disabled={!selectedBrandId}
                    placeholder={
                      selectedBrandId
                        ? loadingLines
                          ? 'Loading lines...'
                          : 'Search or add a line...'
                        : 'Select a brand first...'
                    }
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  {showLineSuggestions && selectedBrandId && (
                    <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                      {lineSuggestions.length > 0 ? (
                        <div className="py-1">
                          {lineSuggestions.map((option) => (
                            <button
                              key={option.id ?? option.label}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => handleSelectLine(option)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No lines found. Add a new one below.
                        </p>
                      )}
                      {lineInput && (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary/10"
                          onMouseDown={() => handleCreateLine(lineInput)}
                          disabled={creatingLine}
                        >
                          {creatingLine ? 'Creating line...' : `Add "${lineInput}" as a new line`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
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

        {/* Step 2: Size & Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Cigar Details</h2>

              <div className="space-y-4">
                {/* Vitola */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vitola (Shape) *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={vitola}
                      onChange={(e) => handleVitolaChange(e.target.value)}
                      onFocus={() => {
                        setShowVitolaSuggestions(true);
                        if (vitolaSuggestions.length === 0) {
                          fetchCigarFieldSuggestions('vitola', '').then((results) => {
                            setVitolaSuggestions(results);
                          });
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowVitolaSuggestions(false), 150)}
                      required
                      placeholder="e.g., Robusto, Toro, Churchill"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {showVitolaSuggestions && vitolaSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                        <div className="py-1">
                          {vitolaSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => {
                                setVitola(option);
                                setShowVitolaSuggestions(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ring Gauge & Length */}
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

                {/* Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country of Origin</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      onFocus={() => {
                        setShowCountrySuggestions(true);
                        if (countrySuggestions.length === 0) {
                          fetchCigarFieldSuggestions('country', '').then((results) => {
                            setCountrySuggestions(results);
                          });
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 150)}
                      placeholder="e.g., Nicaragua, Dominican Republic"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {showCountrySuggestions && countrySuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                        <div className="py-1">
                          {countrySuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => {
                                setCountry(option);
                                setShowCountrySuggestions(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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

        {/* Step 3: Tobacco & Characteristics */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Tobacco & Characteristics</h2>

              <div className="space-y-4">
                {/* Wrapper, Binder, Filler */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wrapper</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={wrapper}
                      onChange={(e) => handleWrapperChange(e.target.value)}
                      onFocus={() => {
                        setShowWrapperSuggestions(true);
                        if (wrapperSuggestions.length === 0) {
                          fetchCigarFieldSuggestions('wrapper', '').then((results) => {
                            setWrapperSuggestions(results);
                          });
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowWrapperSuggestions(false), 150)}
                      placeholder="e.g., Connecticut, Maduro, Habano"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {showWrapperSuggestions && wrapperSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                        <div className="py-1">
                          {wrapperSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => {
                                setWrapper(option);
                                setShowWrapperSuggestions(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Binder</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={binder}
                      onChange={(e) => handleBinderChange(e.target.value)}
                      onFocus={() => {
                        setShowBinderSuggestions(true);
                        if (binderSuggestions.length === 0) {
                          fetchCigarFieldSuggestions('binder', '').then((results) => {
                            setBinderSuggestions(results);
                          });
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowBinderSuggestions(false), 150)}
                      placeholder="e.g., Nicaraguan"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {showBinderSuggestions && binderSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                        <div className="py-1">
                          {binderSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => {
                                setBinder(option);
                                setShowBinderSuggestions(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filler</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filler}
                      onChange={(e) => handleFillerChange(e.target.value)}
                      onFocus={() => {
                        setShowFillerSuggestions(true);
                        if (fillerSuggestions.length === 0) {
                          fetchCigarFieldSuggestions('filler', '').then((results) => {
                            setFillerSuggestions(results);
                          });
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowFillerSuggestions(false), 150)}
                      placeholder="e.g., Nicaraguan, Dominican"
                      className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {showFillerSuggestions && fillerSuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border bg-card shadow-lg">
                        <div className="py-1">
                          {fillerSuggestions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-muted"
                              onMouseDown={() => {
                                setFiller(option);
                                setShowFillerSuggestions(false);
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Strength & Body */}
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

                {/* Price */}
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

            {/* Add to Humidor Section */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addToHumidor"
                  checked={addToHumidor}
                  onChange={(e) => setAddToHumidor(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="addToHumidor" className="text-sm font-medium cursor-pointer">
                  Add to my humidor
                </label>
              </div>
              
              {addToHumidor && (
                <div className="pl-6 space-y-2">
                  <label htmlFor="humidorQuantity" className="text-sm font-medium">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="humidorQuantity"
                    value={humidorQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) > 0 && parseInt(val) <= 1000)) {
                        setHumidorQuantity(val);
                      }
                    }}
                    min="1"
                    max="1000"
                    placeholder="1"
                    className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of cigars of this kind to add to your humidor
                  </p>
                </div>
              )}
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
                disabled={!canSubmit || loading}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Creating...'
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Create Cigar
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

