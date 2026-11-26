export interface Shared {
  code: string;
  input: string;
}

function toBase64(text: string): string {
  const binary = Array.from(new TextEncoder().encode(text), (byte) => String.fromCharCode(byte));
  return btoa(binary.join('')).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64(text: string): string {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/** A URL fragment holding the program, so no server ever receives it. */
export function encodeShare(code: string, input = ''): string {
  const fragment = `#code=${toBase64(code)}`;
  return input ? `${fragment}&input=${toBase64(input)}` : fragment;
}

export function decodeShare(hash: string): Shared | null {
  const params = new URLSearchParams(hash.slice(1));
  const code = params.get('code');
  if (code === null) return null;
  try {
    return { code: fromBase64(code), input: fromBase64(params.get('input') ?? '') };
  } catch {
    return null;
  }
}
