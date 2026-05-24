const MAX_BYTES = 1.5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function readProfilePhotoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject(new Error('Please choose a JPG, PNG, WebP, or GIF image.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('Photo must be smaller than 1.5 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read image.'));
    };
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
