export interface DataUrlParts {
  mimeType: string;
  base64: string;
}

const DATA_URL_PATTERN = /^data:([^;,]+)?(;base64)?,([\s\S]*)$/;

/**
 * Split a data URL into the mime type and the base64 text.
 * FileReader makes a base64 data URL for each imported picture.
 */
export function splitDataUrl(src: string): DataUrlParts {
  const match = DATA_URL_PATTERN.exec(src);

  if (match === null) {
    return { mimeType: "application/octet-stream", base64: src };
  }

  const mimeType = match[1] !== undefined && match[1] !== "" ? match[1] : "application/octet-stream";

  return { mimeType, base64: match[3] ?? "" };
}

/**
 * Build a data URL from the mime type and the base64 text.
 */
export function joinDataUrl(mimeType: string, base64: string): string {
  return `data:${mimeType};base64,${base64}`;
}
