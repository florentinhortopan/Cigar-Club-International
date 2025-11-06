'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Upload, X, Save, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}

interface ProfileEditorProps {
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
}

export default function ProfileEditor({ user: initialUser, onUpdate }: ProfileEditorProps) {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [name, setName] = useState(initialUser.name || '');
  const [image, setImage] = useState(initialUser.image);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUser(initialUser);
    setName(initialUser.name || '');
    setImage(initialUser.image);
    setPreview(null);
  }, [initialUser]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImage(data.url);
        setPreview(null); // Clear preview since we have the actual URL
      } else {
        alert(data.error || 'Failed to upload image');
        setPreview(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          image: image || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        onUpdate(data.user);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayImage = preview || image;
  const hasChanges = name !== (initialUser.name || '') || image !== initialUser.image;

  return (
    <div className="bg-card border rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="relative group">
            {displayImage ? (
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-primary/20">
                <Image
                  src={displayImage}
                  alt={user.name || 'Profile'}
                  fill
                  className="object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="h-16 w-16 text-primary" />
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                id="profile-image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="profile-image-upload"
                className={`cursor-pointer p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-5 w-5" />
              </label>
            </div>
          </div>
          
          {displayImage && (
            <button
              onClick={handleRemoveImage}
              disabled={uploading}
              className="mt-2 text-sm text-destructive hover:underline disabled:opacity-50"
            >
              Remove image
            </button>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full p-3 rounded-lg border bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed. This is your login email.
            </p>
          </div>

          {user.emailVerified && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Email verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving || uploading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

