import { useRef, useState } from 'react';
import { readProfilePhotoFile } from '../lib/profilePhoto';
import { ProfileAvatar } from './ProfileAvatar';
import { Button } from './ui';

export function ProfilePhotoPicker({
  name,
  photoUrl,
  onPhotoChange,
  onError,
}: {
  name: string;
  photoUrl?: string;
  onPhotoChange: (dataUrl: string | undefined) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(photoUrl);
  const [loading, setLoading] = useState(false);

  const displayPhoto = preview ?? photoUrl;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await readProfilePhotoFile(file);
      setPreview(dataUrl);
      onPhotoChange(dataUrl);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Invalid image');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    setPreview(undefined);
    onPhotoChange(undefined);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ProfileAvatar name={name} photoUrl={displayPhoto} size="hero" />
        <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-galaxy-950 bg-gradient-to-br from-candy-500 to-galaxy-600 text-lg shadow-glow">
          ✦
        </span>
      </div>

      <p className="mt-5 text-center text-sm font-medium text-violet-100">{name}</p>
      <p className="mt-1 text-center text-xs text-soft">Your galaxy profile photo</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          variant="candy"
          glow
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? 'Uploading…' : 'Choose Photo'}
        </Button>
        {displayPhoto && (
          <Button type="button" variant="outline" disabled={loading} onClick={removePhoto}>
            Remove
          </Button>
        )}
      </div>

      <p className="mt-3 max-w-xs text-center text-[11px] text-whisper">
        JPG, PNG, WebP or GIF · max 1.5 MB · saved securely in your account
      </p>
    </div>
  );
}
