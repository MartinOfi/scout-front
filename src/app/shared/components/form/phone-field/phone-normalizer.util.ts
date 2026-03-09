export type NormalizeFormat = 'E164' | 'national';

export interface PhoneNormalizerResult {
  normalized: string;
  isValid: boolean;
}

export function normalizePhoneToE164(
  input: string,
  country: string = 'AR'
): PhoneNormalizerResult {
  const digits = input.replace(/\D/g, '');

  if (!digits) {
    return { normalized: '', isValid: false };
  }

  if (digits.startsWith('+')) {
    const clean = digits.replace(/[^\d]/g, '');
    return { normalized: `+${clean}`, isValid: clean.length >= 10 };
  }

  switch (country) {
    case 'AR':
      return normalizeArgentinaToE164(digits);
    case 'US':
      return normalizeUSToE164(digits);
    default:
      return normalizeGenericToE164(digits, country);
  }
}

function normalizeArgentinaToE164(digits: string): PhoneNormalizerResult {
  if (digits.length === 0) {
    return { normalized: '', isValid: false };
  }

  if (digits.startsWith('0')) {
    const withoutZero = digits.slice(1);
    if (withoutZero.length === 10) {
      return {
        normalized: `+54${withoutZero}`,
        isValid: true,
      };
    }
  }

  if (digits.length === 10) {
    return {
      normalized: `+54${digits}`,
      isValid: true,
    };
  }

  if (digits.length === 11 && digits.startsWith('54')) {
    return {
      normalized: `+${digits}`,
      isValid: true,
    };
  }

  if (digits.length === 12 && digits.startsWith('54')) {
    return {
      normalized: `+${digits}`,
      isValid: digits.slice(2).length === 10,
    };
  }

  return {
    normalized: `+54${digits.slice(-10)}`,
    isValid: digits.length >= 10,
  };
}

function normalizeUSToE164(digits: string): PhoneNormalizerResult {
  if (digits.length === 0) {
    return { normalized: '', isValid: false };
  }

  if (digits.length === 10) {
    return {
      normalized: `+1${digits}`,
      isValid: true,
    };
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return {
      normalized: `+${digits}`,
      isValid: true,
    };
  }

  return { normalized: `+1${digits.slice(-10)}`, isValid: digits.length >= 10 };
}

function normalizeGenericToE164(
  digits: string,
  country: string
): PhoneNormalizerResult {
  const countryCodes: Record<string, string> = {
    AR: '54',
    US: '1',
    BR: '55',
    MX: '52',
    CL: '56',
    CO: '57',
    PE: '51',
  };

  const countryCode = countryCodes[country] || '';
  if (!countryCode) {
    return { normalized: digits, isValid: false };
  }

  if (digits.startsWith(countryCode)) {
    return {
      normalized: `+${digits}`,
      isValid: digits.length >= 10,
    };
  }

  return {
    normalized: `+${countryCode}${digits}`,
    isValid: digits.length >= 10,
  };
}

export function denormalizeE164ToNational(
  e164: string,
  country: string = 'AR'
): string {
  if (!e164.startsWith('+')) {
    return e164;
  }

  const withoutPlus = e164.slice(1);
  const countryCodes: Record<string, string> = {
    AR: '54',
    US: '1',
    BR: '55',
    MX: '52',
    CL: '56',
    CO: '57',
    PE: '51',
  };

  const countryCode = countryCodes[country] || '';
  if (!countryCode || !withoutPlus.startsWith(countryCode)) {
    return e164;
  }

  return withoutPlus.slice(countryCode.length);
}
