export interface RadianceHdrImage {
  width: number;
  height: number;
  // Linear RGBA, row 0 = top of the image
  pixels: Float32Array;
}

const HEADER_END = "\n\n";
const MIN_RLE_WIDTH = 8;
const MAX_RLE_WIDTH = 0x7fff;

const readHeaderText = (bytes: Uint8Array): { headerText: string; dataOffset: number } => {
  // Header + resolution line are plain ASCII; 4KB is plenty to find both
  const headSlice = new TextDecoder("ascii").decode(bytes.subarray(0, Math.min(bytes.length, 4096)));
  const headerEnd = headSlice.indexOf(HEADER_END);
  if (!headSlice.startsWith("#?") || headerEnd === -1) {
    throw new Error("Not a Radiance HDR file");
  }

  const resolutionStart = headerEnd + HEADER_END.length;
  const resolutionEnd = headSlice.indexOf("\n", resolutionStart);
  const headerText = headSlice.slice(0, resolutionEnd);

  return { headerText, dataOffset: resolutionEnd + 1 };
};

const parseResolution = (headerText: string): { width: number; height: number } => {
  const match = headerText.match(/-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/);
  if (!match) throw new Error("Unsupported HDR orientation (expected -Y h +X w)");
  return { height: Number(match[1]), width: Number(match[2]) };
};

// Decodes one scanline of RGBE bytes into `scanline` (width * 4)
const readRgbeScanline = (bytes: Uint8Array, offset: number, width: number, scanline: Uint8Array): number => {
  const isRunLengthEncoded =
    width >= MIN_RLE_WIDTH &&
    width <= MAX_RLE_WIDTH &&
    bytes[offset] === 2 &&
    bytes[offset + 1] === 2 &&
    ((bytes[offset + 2]! << 8) | bytes[offset + 3]!) === width;

  if (!isRunLengthEncoded) {
    scanline.set(bytes.subarray(offset, offset + width * 4));
    return offset + width * 4;
  }

  let cursor = offset + 4;

  // New-style RLE stores each of the 4 channels separately
  for (let channel = 0; channel < 4; channel++) {
    let x = 0;
    while (x < width) {
      let count = bytes[cursor++]!;

      if (count > 128) {
        count -= 128;
        const value = bytes[cursor++]!;
        for (let i = 0; i < count; i++) scanline[(x++) * 4 + channel] = value;
      } else {
        for (let i = 0; i < count; i++) scanline[(x++) * 4 + channel] = bytes[cursor++]!;
      }
    }
  }

  return cursor;
};

/** Parses a Radiance RGBE (.hdr) file into linear float RGBA. */
export const parseRadianceHdr = (buffer: ArrayBuffer): RadianceHdrImage => {
  const bytes = new Uint8Array(buffer);
  const { headerText, dataOffset } = readHeaderText(bytes);
  const { width, height } = parseResolution(headerText);

  const pixels = new Float32Array(width * height * 4);
  const scanline = new Uint8Array(width * 4);
  let cursor = dataOffset;

  for (let y = 0; y < height; y++) {
    cursor = readRgbeScanline(bytes, cursor, width, scanline);

    for (let x = 0; x < width; x++) {
      const source = x * 4;
      const target = (y * width + x) * 4;
      const exponent = scanline[source + 3]!;
      // RGBE: mantissa * 2^(exponent - 128) / 256
      const scale = exponent === 0 ? 0 : Math.pow(2, exponent - 136);

      pixels[target] = scanline[source]! * scale;
      pixels[target + 1] = scanline[source + 1]! * scale;
      pixels[target + 2] = scanline[source + 2]! * scale;
      pixels[target + 3] = 1;
    }
  }

  return { width, height, pixels };
};

export const loadRadianceHdr = async (url: string): Promise<RadianceHdrImage> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load HDR ${url} (${response.status})`);
  return parseRadianceHdr(await response.arrayBuffer());
};
