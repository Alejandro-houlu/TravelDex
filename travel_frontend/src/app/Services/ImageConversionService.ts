import { Injectable } from "@angular/core";
import heic2any from 'heic2any';

@Injectable()

export class ImageConversionService{
    async toJpeg(blob: Blob): Promise<Blob> {
    // Quick check by MIME type or extension:
    const isHeic =
      blob.type === 'image/heic' ||
      blob.type === 'image/heif' ||
      (blob instanceof File && /\.heic$/i.test(blob.name));

    if (!isHeic) {
      // Not HEIC → pass through
      return blob;
    }

    // Try native canvas route
    try {
      return await this.fileToJpegViaCanvas(blob);
    } catch {
      // Fallback to heic2any
      const converted = await heic2any({
        blob,
        toType: 'image/jpeg',
        quality: 0.9
      });
      // heic2any may return an array if multiple images; take first
      return Array.isArray(converted) ? converted[0] : converted;
    }
  }

  /** Draws the image into a hidden canvas and re-encodes as JPEG */
  private fileToJpegViaCanvas(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(jpegBlob => {
          if (jpegBlob) resolve(jpegBlob);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/jpeg', 0.9);
      };
      img.onerror = err => {
        URL.revokeObjectURL(img.src);
        reject(err);
      };
      // Create an object URL that the <img> can decode
      img.src = URL.createObjectURL(blob);
    });
  }
}
