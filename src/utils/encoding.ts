const MOJIBAKE_MARKERS = /[\u00c2\u00c3\u00c4\u00e1]/;
const QUOTED_TEXT_PATTERN = /"([^"]*)"/g;

export const decodeMojibake = (value: string) => {
  if (!MOJIBAKE_MARKERS.test(value)) return value;

  const bytes: number[] = [];
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code > 0xff) return value;
    bytes.push(code);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Uint8Array.from(bytes),
    );
  } catch {
    return value;
  }
};

export const decodeMojibakeInText = (value: string) => {
  if (!MOJIBAKE_MARKERS.test(value)) return value;

  const decodedValue = decodeMojibake(value);
  if (decodedValue !== value) return decodedValue;

  return value.replace(QUOTED_TEXT_PATTERN, (match, quoted: string) => {
    const decodedQuote = decodeMojibake(quoted);
    return decodedQuote === quoted ? match : `"${decodedQuote}"`;
  });
};
