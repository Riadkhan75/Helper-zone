/**
 * Helper to compress and convert any device photo (mobile camera/gallery/desktop)
 * into a lightweight optimized base64 data URL for fast instant rendering and persistence.
 */
export const compressImageFile = (
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPEG, PNG, WebP) নির্বাচন করুন।'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবি লোড করতে সমস্যা হয়েছে।'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas context unavailable
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as JPEG with specified quality
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
