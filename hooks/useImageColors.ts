import { useState, useEffect } from 'react';
import { IMAGE_COLOR_DEFAULTS } from '@/constants/storefront';

export enum ColorMode {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export interface UseImageColorsOptions {
  fallbackColor?: string;
  palette?: string[];
  mode?: ColorMode;
}

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function findClosestPaletteColor(rDom: number, gDom: number, bDom: number, palette: string[]): string {
  if (palette.length === 0) return '';
  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const color of palette) {
    try {
      const [r, g, b] = hexToRgb(color);
      const distance = Math.sqrt(
        Math.pow(r - rDom, 2) + Math.pow(g - gDom, 2) + Math.pow(b - bDom, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    } catch {
      // Ignore invalid hex strings
    }
  }
  return closestColor;
}

export function useImageColors(imageUrl: string | undefined, options?: UseImageColorsOptions) {
  const [colors, setColors] = useState<{
    bg: string;
    solidBg: string;
    dominant: string;
  }>({
    bg: IMAGE_COLOR_DEFAULTS.fallbackColor,
    solidBg: IMAGE_COLOR_DEFAULTS.fallbackColor,
    dominant: IMAGE_COLOR_DEFAULTS.fallbackColor
  });

  const fallbackColorDep = options?.fallbackColor;
  const modeDep = options?.mode;
  const paletteDep = options?.palette ? JSON.stringify(options.palette) : '';

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Downscale to speed up processing
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        // Extract corner pixels
        const topLeft = ctx.getImageData(0, 0, 1, 1).data;
        const topRight = ctx.getImageData(49, 0, 1, 1).data;
        const bottomLeft = ctx.getImageData(0, 49, 1, 1).data;
        const bottomRight = ctx.getImageData(49, 49, 1, 1).data;

        // Calculate edge averages
        const rTop = Math.round((topLeft[0] + topRight[0]) / 2);
        const gTop = Math.round((topLeft[1] + topRight[1]) / 2);
        const bTop = Math.round((topLeft[2] + topRight[2]) / 2);
        const aTop = ((topLeft[3] + topRight[3]) / 2) / 255;

        const rBottom = Math.round((bottomLeft[0] + bottomRight[0]) / 2);
        const gBottom = Math.round((bottomLeft[1] + bottomRight[1]) / 2);
        const bBottom = Math.round((bottomLeft[2] + bottomRight[2]) / 2);
        const aBottom = ((bottomLeft[3] + bottomRight[3]) / 2) / 255;

        const rLeft = Math.round((topLeft[0] + bottomLeft[0]) / 2);
        const gLeft = Math.round((topLeft[1] + bottomLeft[1]) / 2);
        const bLeft = Math.round((topLeft[2] + bottomLeft[2]) / 2);
        const aLeft = ((topLeft[3] + bottomLeft[3]) / 2) / 255;

        const rRight = Math.round((topRight[0] + bottomRight[0]) / 2);
        const gRight = Math.round((topRight[1] + bottomRight[1]) / 2);
        const bRight = Math.round((topRight[2] + bottomRight[2]) / 2);
        const aRight = ((topRight[3] + bottomRight[3]) / 2) / 255;

        // Extract dominant/average color from 1x1 downscaled image
        const canvas1x1 = document.createElement('canvas');
        const ctx1x1 = canvas1x1.getContext('2d');
        let rDom = 15, gDom = 23, bDom = 42, aDom = 255;
        if (ctx1x1) {
          canvas1x1.width = 1;
          canvas1x1.height = 1;
          ctx1x1.drawImage(img, 0, 0, 1, 1);
          const domData = ctx1x1.getImageData(0, 0, 1, 1).data;
          rDom = domData[0];
          gDom = domData[1];
          bDom = domData[2];
          aDom = domData[3];
        }

        // Determine default fallback color
        const brightness = 0.299 * rDom + 0.587 * gDom + 0.114 * bDom;
        const isLightMode = options?.mode === ColorMode.LIGHT || 
                           (options?.mode !== ColorMode.DARK && brightness > 128);
        
        let activeFallback = options?.fallbackColor || 
          (isLightMode ? IMAGE_COLOR_DEFAULTS.bgLight : IMAGE_COLOR_DEFAULTS.bgDark);

        // If a palette is provided, select the closest color in the palette to the dominant color
        if (options?.palette && options.palette.length > 0) {
          activeFallback = findClosestPaletteColor(rDom, gDom, bDom, options.palette);
        }

        // Parse activeFallback to RGB to perform transparency blending
        let fallbackRgb: [number, number, number] = [248, 250, 252];
        if (activeFallback.startsWith('rgb')) {
          const matches = activeFallback.match(/\d+/g);
          if (matches && matches.length >= 3) {
            fallbackRgb = [parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2])];
          }
        } else if (activeFallback.startsWith('#')) {
          try {
            fallbackRgb = hexToRgb(activeFallback);
          } catch {
            // ignore
          }
        }

        // Blend transparent background pixels with activeFallback instead of forcing solid black
        const resolveColor = (r: number, g: number, b: number, a: number) => {
          const blendedR = Math.round(r * a + fallbackRgb[0] * (1 - a));
          const blendedG = Math.round(g * a + fallbackRgb[1] * (1 - a));
          const blendedB = Math.round(b * a + fallbackRgb[2] * (1 - a));
          return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
        };

        // Detect if image background is substantially transparent
        const avgAlpha = (aTop + aBottom + aLeft + aRight) / 4;
        const isTransparentBg = avgAlpha < 0.15;

        // Resolve blended colors FIRST (before any averaging),
        // so transparent (0,0,0) pixels never contribute raw black values
        const topColorStr = resolveColor(rTop, gTop, bTop, aTop);
        const bottomColorStr = resolveColor(rBottom, gBottom, bBottom, aBottom);
        const leftColorStr = resolveColor(rLeft, gLeft, bLeft, aLeft);
        const rightColorStr = resolveColor(rRight, gRight, bRight, aRight);

        // Parse already-blended rgb() strings back to numbers so we average
        // the visually-correct blended values, not the raw 0-for-transparent values
        const parseRgb = (s: string): [number, number, number] => {
          const m = s.match(/\d+/g);
          return m ? [+m[0], +m[1], +m[2]] : fallbackRgb;
        };
        const [trR, trG, trB] = parseRgb(topColorStr);
        const [brR, brG, brB] = parseRgb(bottomColorStr);
        const solidBgR = Math.round((trR + brR) / 2);
        const solidBgG = Math.round((trG + brG) / 2);
        const solidBgB = Math.round((trB + brB) / 2);
        const solidBgColor = `rgb(${solidBgR}, ${solidBgG}, ${solidBgB})`;

        // Variance is computed on raw values (already ~0 for transparent),
        // so force fallback when bg is transparent rather than showing black
        let finalBg = '';
        if (isTransparentBg) {
          finalBg = activeFallback;
        } else {
          const diffV = Math.abs(trR - brR) + Math.abs(trG - brG) + Math.abs(trB - brB);
          const [lrR, lrG, lrB] = parseRgb(leftColorStr);
          const [rrR, rrG, rrB] = parseRgb(rightColorStr);
          const diffH = Math.abs(lrR - rrR) + Math.abs(lrG - rrG) + Math.abs(lrB - rrB);
          const maxVariance = Math.max(diffV, diffH);

          if (maxVariance < 15) {
            finalBg = solidBgColor;
          } else if (diffV >= diffH) {
            finalBg = `linear-gradient(to bottom, ${topColorStr}, ${bottomColorStr})`;
          } else {
            finalBg = `linear-gradient(to right, ${leftColorStr}, ${rightColorStr})`;
          }
        }

        setColors({
          bg: finalBg,
          solidBg: solidBgColor,
          dominant: `rgba(${rDom}, ${gDom}, ${bDom}, ${aDom / 255})`
        });
      } catch {
        // Safe fail silent (log scrubbing)
      }
    };
  }, [imageUrl, fallbackColorDep, modeDep, paletteDep]);

  return colors;
}
