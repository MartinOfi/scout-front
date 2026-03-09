export type PhoneMaskFormat = 'AR' | 'US' | 'E164';

export interface PhoneMaskResult {
  formatted: string;
  raw: string;
}

export function applyPhoneMask(
  input: string,
  format: PhoneMaskFormat = 'AR'
): PhoneMaskResult {
  const digits = input.replace(/\D/g, '');

  if (!digits) {
    return { formatted: '', raw: '' };
  }

  switch (format) {
    case 'AR':
      return applyArgentinaMask(digits);
    case 'US':
      return applyUSMask(digits);
    case 'E164':
      return { formatted: digits, raw: digits };
    default:
      return { formatted: digits, raw: digits };
  }
}

function applyArgentinaMask(digits: string): PhoneMaskResult {
  if (digits.length === 0) {
    return { formatted: '', raw: '' };
  }

  if (digits.length <= 2) {
    return { formatted: `(${digits}`, raw: digits };
  }

  if (digits.length <= 6) {
    const areaCode = digits.slice(0, 2);
    const firstPart = digits.slice(2);
    return { formatted: `(${areaCode}) ${firstPart}`, raw: digits };
  }

  if (digits.length <= 10) {
    const areaCode = digits.slice(0, 2);
    const firstPart = digits.slice(2, 6);
    const secondPart = digits.slice(6);
    return {
      formatted: `(${areaCode}) ${firstPart}-${secondPart}`,
      raw: digits,
    };
  }

  const areaCode = digits.slice(0, 2);
  const firstPart = digits.slice(2, 6);
  const secondPart = digits.slice(6, 10);
  return {
    formatted: `(${areaCode}) ${firstPart}-${secondPart}`,
    raw: digits.slice(0, 10),
  };
}

function applyUSMask(digits: string): PhoneMaskResult {
  if (digits.length === 0) {
    return { formatted: '', raw: '' };
  }

  if (digits.length <= 3) {
    return { formatted: `(${digits}`, raw: digits };
  }

  if (digits.length <= 6) {
    const areaCode = digits.slice(0, 3);
    const firstPart = digits.slice(3);
    return { formatted: `(${areaCode}) ${firstPart}`, raw: digits };
  }

  if (digits.length <= 10) {
    const areaCode = digits.slice(0, 3);
    const firstPart = digits.slice(3, 6);
    const secondPart = digits.slice(6);
    return {
      formatted: `(${areaCode}) ${firstPart}-${secondPart}`,
      raw: digits,
    };
  }

  const areaCode = digits.slice(0, 3);
  const firstPart = digits.slice(3, 6);
  const secondPart = digits.slice(6, 10);
  return {
    formatted: `(${areaCode}) ${firstPart}-${secondPart}`,
    raw: digits.slice(0, 10),
  };
}

export function removePhoneMask(formatted: string): string {
  return formatted.replace(/\D/g, '');
}
