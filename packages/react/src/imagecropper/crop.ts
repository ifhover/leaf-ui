import type { CropArea, ImageCropResult } from './imagecropper';
export async function cropImage(
  src: string,
  area: CropArea,
  rotation: number,
  shape: 'rect' | 'round',
  type: string,
  quality: number,
  crossOrigin?: 'anonymous' | 'use-credentials',
): Promise<ImageCropResult> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to load image for export.'));
    img.src = src;
  });
  const radians = (rotation * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const rotated = document.createElement('canvas');
  rotated.width = Math.ceil(image.naturalWidth * cosine + image.naturalHeight * sine);
  rotated.height = Math.ceil(image.naturalWidth * sine + image.naturalHeight * cosine);
  const context = rotated.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');
  context.translate(rotated.width / 2, rotated.height / 2);
  context.rotate(radians);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const output = canvas.getContext('2d');
  if (!output) throw new Error('Canvas is unavailable.');
  if (type === 'image/jpeg') {
    output.fillStyle = '#fff';
    output.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (shape === 'round') {
    output.beginPath();
    output.ellipse(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      canvas.height / 2,
      0,
      0,
      2 * Math.PI,
    );
    output.clip();
  }
  output.drawImage(
    rotated,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('Image export failed.'))),
      type,
      quality,
    );
  });
  return { blob, width: canvas.width, height: canvas.height };
}
