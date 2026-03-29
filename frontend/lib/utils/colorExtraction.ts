/**
 * Color extraction utility using Canvas API.
 * Extracts dominant colors from an image file for theme customization.
 */

export interface ExtractedColors {
    primary: string;
    secondary: string;
}

interface RGBColor {
    r: number;
    g: number;
    b: number;
}

const CANVAS_SIZE = 100;
const QUANTIZE_STEP = 16;
const MIN_COLOR_DISTANCE = 80;
const WHITE_THRESHOLD = 700;
const BLACK_THRESHOLD = 60;
const ALPHA_THRESHOLD = 128;

/**
 * Convert RGB to hex string.
 */
function rgbToHex({ r, g, b }: RGBColor): string {
    return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Calculate Euclidean distance between two RGB colors.
 */
function colorDistance(a: RGBColor, b: RGBColor): number {
    return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

/**
 * Convert RGB to HSL and shift hue by a given amount of degrees.
 */
function shiftHue(color: RGBColor, degrees: number): RGBColor {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    // Shift hue
    h = (h + degrees / 360) % 1;
    if (h < 0) h += 1;

    // HSL to RGB
    const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    if (s === 0) {
        const val = Math.round(l * 255);
        return { r: val, g: val, b: val };
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
}

/**
 * Parse a quantized color key back to RGB.
 */
function parseColorKey(key: string): RGBColor {
    const [r, g, b] = key.split(',').map(Number);
    return { r, g, b };
}

/**
 * Load a File as an HTMLImageElement.
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}

/**
 * Load an image from a URL (must be same-origin or CORS-enabled).
 */
function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image from URL'));
        img.src = url;
    });
}

/**
 * Extract dominant colors from image pixel data.
 */
function extractFromImage(img: HTMLImageElement): ExtractedColors {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas 2D context not available');
    }

    ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const { data } = imageData;

    // Build frequency map of quantized colors
    const colorMap = new Map<string, number>();

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip transparent pixels
        if (a < ALPHA_THRESHOLD) continue;

        // Skip near-white and near-black
        const sum = r + g + b;
        if (sum > WHITE_THRESHOLD || sum < BLACK_THRESHOLD) continue;

        // Quantize
        const qr = Math.round(r / QUANTIZE_STEP) * QUANTIZE_STEP;
        const qg = Math.round(g / QUANTIZE_STEP) * QUANTIZE_STEP;
        const qb = Math.round(b / QUANTIZE_STEP) * QUANTIZE_STEP;

        const key = `${qr},${qg},${qb}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency
    const sorted = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        // Fallback if no colors found (e.g., all white/black image)
        return { primary: '#6366f1', secondary: '#14b8a6' };
    }

    const primaryColor = parseColorKey(sorted[0][0]);

    // Find secondary with minimum distance from primary
    let secondaryColor: RGBColor | null = null;
    for (let i = 1; i < sorted.length; i++) {
        const candidate = parseColorKey(sorted[i][0]);
        if (colorDistance(primaryColor, candidate) >= MIN_COLOR_DISTANCE) {
            secondaryColor = candidate;
            break;
        }
    }

    // If no sufficiently different color found, shift hue
    if (!secondaryColor) {
        secondaryColor = shiftHue(primaryColor, 30);
    }

    return {
        primary: rgbToHex(primaryColor),
        secondary: rgbToHex(secondaryColor),
    };
}

/**
 * Extract dominant colors from an image file.
 * Returns primary and secondary colors as hex strings.
 *
 * @param file - The image file to extract colors from
 * @returns Promise resolving to extracted primary and secondary colors
 * @throws Error if file is SVG (not supported) or image fails to load
 */
export async function extractDominantColors(file: File): Promise<ExtractedColors> {
    if (file.type === 'image/svg+xml') {
        throw new Error('SVG color extraction is not supported. Please pick colors manually.');
    }

    const img = await loadImageFromFile(file);
    return extractFromImage(img);
}

/**
 * Extract dominant colors from an image URL.
 * The URL must be same-origin or have CORS headers.
 *
 * @param url - The image URL to extract colors from
 * @returns Promise resolving to extracted primary and secondary colors
 */
export async function extractDominantColorsFromUrl(url: string): Promise<ExtractedColors> {
    if (url.endsWith('.svg')) {
        throw new Error('SVG color extraction is not supported. Please pick colors manually.');
    }

    const img = await loadImageFromUrl(url);
    return extractFromImage(img);
}
