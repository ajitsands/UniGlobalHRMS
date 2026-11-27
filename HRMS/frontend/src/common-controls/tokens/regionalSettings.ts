export type AppDateFormat =
  | 'DD-MM-YYYY'
  | 'DD-MMM-YYYY'
  | 'DD/MM/YYYY'
  | 'DD MMM YYYY'
  | 'YYYY-MM-DD'
  | 'MM/DD/YYYY';

export type AppTimeFormat = '12h' | '24h';

export type GulfCurrencyCode = 'BHD' | 'SAR' | 'AED' | 'KWD' | 'QAR' | 'OMR' | 'USD';

export type GulfTimeZoneId =
  | 'Asia/Bahrain'
  | 'Asia/Riyadh'
  | 'Asia/Kuwait'
  | 'Asia/Qatar'
  | 'Asia/Dubai'
  | 'Asia/Muscat'
  | 'UTC'
  | 'Asia/Kolkata';

export interface CurrencyMetadata {
  code: GulfCurrencyCode;
  symbol: string;
  name: string;
  nameAr: string;
  country: string;
  decimals: 2 | 3;
  step: string;
  subUnit: string;
  rateFromBhd: number; // approximate peg ratio from BHD for live multi-currency demo preview
}

export const GULF_CURRENCIES: CurrencyMetadata[] = [
  {
    code: 'BHD',
    symbol: 'BD',
    name: 'Bahraini Dinar (Default)',
    nameAr: 'دينار بحريني (الافتراضي)',
    country: 'Kingdom of Bahrain',
    decimals: 3,
    step: '0.001',
    subUnit: '1,000 Fils',
    rateFromBhd: 1,
  },
  {
    code: 'SAR',
    symbol: 'SAR',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    country: 'Kingdom of Saudi Arabia',
    decimals: 2,
    step: '0.01',
    subUnit: '100 Halalas',
    rateFromBhd: 9.95,
  },
  {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    nameAr: 'درهم إماراتي',
    country: 'United Arab Emirates',
    decimals: 2,
    step: '0.01',
    subUnit: '100 Fils',
    rateFromBhd: 9.73,
  },
  {
    code: 'KWD',
    symbol: 'KD',
    name: 'Kuwaiti Dinar',
    nameAr: 'دينار كويتي',
    country: 'State of Kuwait',
    decimals: 3,
    step: '0.001',
    subUnit: '1,000 Fils',
    rateFromBhd: 0.815,
  },
  {
    code: 'QAR',
    symbol: 'QAR',
    name: 'Qatari Riyal',
    nameAr: 'ريال قطري',
    country: 'State of Qatar',
    decimals: 2,
    step: '0.01',
    subUnit: '100 Dirhams',
    rateFromBhd: 9.65,
  },
  {
    code: 'OMR',
    symbol: 'OMR',
    name: 'Omani Rial',
    nameAr: 'ريال عماني',
    country: 'Sultanate of Oman',
    decimals: 3,
    step: '0.001',
    subUnit: '1,000 Baisa',
    rateFromBhd: 1.02,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (International)',
    nameAr: 'دولار أمريكي',
    country: 'International',
    decimals: 2,
    step: '0.01',
    subUnit: '100 Cents',
    rateFromBhd: 2.65,
  },
];

export interface TimeZoneMetadata {
  id: GulfTimeZoneId;
  label: string;
  labelAr: string;
  utcOffset: string;
  region: string;
}

export const GULF_TIMEZONES: TimeZoneMetadata[] = [
  {
    id: 'Asia/Bahrain',
    label: 'Bahrain — Manama (AST, Default)',
    labelAr: 'البحرين — المنامة (الافتراضي)',
    utcOffset: 'UTC+03:00',
    region: 'GCC',
  },
  {
    id: 'Asia/Riyadh',
    label: 'Saudi Arabia — Riyadh (AST)',
    labelAr: 'السعودية — الرياض',
    utcOffset: 'UTC+03:00',
    region: 'GCC',
  },
  {
    id: 'Asia/Kuwait',
    label: 'Kuwait — Kuwait City (AST)',
    labelAr: 'الكويت — مدينة الكويت',
    utcOffset: 'UTC+03:00',
    region: 'GCC',
  },
  {
    id: 'Asia/Qatar',
    label: 'Qatar — Doha (AST)',
    labelAr: 'قطر — الدوحة',
    utcOffset: 'UTC+03:00',
    region: 'GCC',
  },
  {
    id: 'Asia/Dubai',
    label: 'United Arab Emirates — Dubai / Abu Dhabi (GST)',
    labelAr: 'الإمارات — دبي / أبوظبي',
    utcOffset: 'UTC+04:00',
    region: 'GCC',
  },
  {
    id: 'Asia/Muscat',
    label: 'Oman — Muscat (GST)',
    labelAr: 'عُمان — مسقط',
    utcOffset: 'UTC+04:00',
    region: 'GCC',
  },
  {
    id: 'UTC',
    label: 'Coordinated Universal Time (UTC)',
    labelAr: 'التوقيت العالمي المنسق (UTC)',
    utcOffset: 'UTC+00:00',
    region: 'Global',
  },
  {
    id: 'Asia/Kolkata',
    label: 'India — Support / Engineering Office (IST)',
    labelAr: 'الهند — مكتب التطوير والدعم',
    utcOffset: 'UTC+05:30',
    region: 'Regional',
  },
];

export const DATE_FORMAT_OPTIONS: { value: AppDateFormat; label: string; example: string }[] = [
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (Bahrain / GCC Default)', example: '28-11-2026' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (Hyphenated Month, e.g. 12-May-2026)', example: '12-May-2026' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Slash Standard)', example: '28/11/2026' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (Executive Readable)', example: '28 Nov 2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601 Technical)', example: '2026-11-28' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)', example: '11/28/2026' },
];

export interface GulfCountryPreset {
  id: string;
  country: string;
  countryAr: string;
  badge: string;
  currency: GulfCurrencyCode;
  timeZone: GulfTimeZoneId;
  dateFormat: AppDateFormat;
  timeFormat: AppTimeFormat;
  statutoryBody: string;
}

export const GULF_COUNTRY_PRESETS: GulfCountryPreset[] = [
  {
    id: 'bahrain',
    country: 'Kingdom of Bahrain (Default)',
    countryAr: 'مملكة البحرين (الافتراضي)',
    badge: 'BH • UTC+3',
    currency: 'BHD',
    timeZone: 'Asia/Bahrain',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
    statutoryBody: 'SIO & LMRA WPS',
  },
  {
    id: 'saudi',
    country: 'Kingdom of Saudi Arabia',
    countryAr: 'المملكة العربية السعودية',
    badge: 'SA • UTC+3',
    currency: 'SAR',
    timeZone: 'Asia/Riyadh',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
    statutoryBody: 'GOSI & Mudad WPS',
  },
  {
    id: 'uae',
    country: 'United Arab Emirates',
    countryAr: 'الإمارات العربية المتحدة',
    badge: 'AE • UTC+4',
    currency: 'AED',
    timeZone: 'Asia/Dubai',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    statutoryBody: 'GPSSA & MOHRE WPS',
  },
  {
    id: 'kuwait',
    country: 'State of Kuwait',
    countryAr: 'دولة الكويت',
    badge: 'KW • UTC+3',
    currency: 'KWD',
    timeZone: 'Asia/Kuwait',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
    statutoryBody: 'PIFSS & PAM WPS',
  },
  {
    id: 'qatar',
    country: 'State of Qatar',
    countryAr: 'دولة قطر',
    badge: 'QA • UTC+3',
    currency: 'QAR',
    timeZone: 'Asia/Qatar',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
    statutoryBody: 'GRSIA & QCB WPS',
  },
  {
    id: 'oman',
    country: 'Sultanate of Oman',
    countryAr: 'سلطنة عُمان',
    badge: 'OM • UTC+4',
    currency: 'OMR',
    timeZone: 'Asia/Muscat',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
    statutoryBody: 'SPF & Oman WPS',
  },
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getCurrencyMeta(code?: string): CurrencyMetadata {
  const upper = (code || 'BHD').toUpperCase();
  return GULF_CURRENCIES.find((c) => c.code === upper) ?? GULF_CURRENCIES[0];
}

function buildDateTokens(year: string, month2: string, day2: string, dateFormat: AppDateFormat): string {
  const monthIdx = Math.max(0, Math.min(11, Number(month2) - 1));
  const mmm = SHORT_MONTHS[monthIdx];
  switch (dateFormat) {
    case 'DD-MMM-YYYY':
      return `${day2}-${mmm}-${year}`;
    case 'DD/MM/YYYY':
      return `${day2}/${month2}/${year}`;
    case 'DD MMM YYYY':
      return `${day2} ${mmm} ${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month2}-${day2}`;
    case 'MM/DD/YYYY':
      return `${month2}/${day2}/${year}`;
    case 'DD-MM-YYYY':
    default:
      return `${day2}-${month2}-${year}`;
  }
}

/**
 * Formats any ISO date ('YYYY-MM-DD'), human date ('15 Nov 2026'), or UTC timestamp
 * strictly using the application's configured DateFormat and TimeZone.
 */
export function formatAppDateValue(
  input: string | Date | undefined | null,
  dateFormat: AppDateFormat = 'DD-MM-YYYY',
  timeZone: string = 'Asia/Bahrain'
): string {
  if (!input) return '';

  // Pure calendar date 'YYYY-MM-DD': keep exact calendar day without timezone shifting
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    const [y, m, d] = input.trim().split('-');
    return buildDateTokens(y, m, d, dateFormat);
  }

  // Human 'DD MMM YYYY' or 'DD-MMM-YYYY' e.g. '15 Nov 2026' or '12-May-2026'
  if (typeof input === 'string' && /^\d{1,2}[\s-]+[A-Za-z]{3}[\s-]+\d{4}$/.test(input.trim())) {
    const parts = input.trim().split(/[\s-]+/);
    const d = parts[0].padStart(2, '0');
    const mIdx = SHORT_MONTHS.findIndex((x) => x.toLowerCase() === parts[1].toLowerCase());
    if (mIdx >= 0) {
      return buildDateTokens(parts[2], String(mIdx + 1).padStart(2, '0'), d, dateFormat);
    }
  }

  const dt = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dt.getTime())) return String(input);

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(dt);
    const y = parts.find((p) => p.type === 'year')?.value ?? String(dt.getFullYear());
    const m = parts.find((p) => p.type === 'month')?.value ?? String(dt.getMonth() + 1).padStart(2, '0');
    const d = parts.find((p) => p.type === 'day')?.value ?? String(dt.getDate()).padStart(2, '0');
    return buildDateTokens(y, m, d, dateFormat);
  } catch {
    const y = String(dt.getFullYear());
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return buildDateTokens(y, m, d, dateFormat);
  }
}

export function formatAppTimeValue(
  input: Date | string,
  timeFormat: AppTimeFormat = '12h',
  timeZone: string = 'Asia/Bahrain',
  includeSeconds = false
): string {
  const dt = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(dt.getTime())) return String(input);

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: timeFormat === '12h',
    }).format(dt);
  } catch {
    return dt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
      hour12: timeFormat === '12h',
    });
  }
}

export function formatAppHourSlot(hour24: number, timeFormat: AppTimeFormat = '12h'): string {
  const h = ((Math.round(hour24) % 24) + 24) % 24;
  if (timeFormat === '24h') {
    return `${String(h).padStart(2, '0')}:00`;
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hr12).padStart(2, '0')}:00 ${suffix}`;
}

export function formatAppDateTimeValue(
  input: Date | string,
  dateFormat: AppDateFormat = 'DD-MM-YYYY',
  timeFormat: AppTimeFormat = '12h',
  timeZone: string = 'Asia/Bahrain',
  includeSeconds = true
): string {
  const d = formatAppDateValue(input, dateFormat, timeZone);
  const t = formatAppTimeValue(input, timeFormat, timeZone, includeSeconds);
  return `${d} • ${t}`;
}

export function getTodayIsoInTimeZone(timeZone: string = 'Asia/Bahrain'): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    // fallback below
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function formatAppCurrencyParts(
  amount: number,
  currencyCode: GulfCurrencyCode = 'BHD',
  convertFromBhd = false
): { code: GulfCurrencyCode; digits: string } {
  const meta = getCurrencyMeta(currencyCode);
  const numeric = Number.isFinite(amount) ? amount : 0;
  const effective = convertFromBhd ? numeric * meta.rateFromBhd : numeric;
  const formattedNum = effective.toLocaleString('en-US', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });
  return { code: meta.code, digits: formattedNum };
}

export function formatAppCurrencyValue(
  amount: number,
  currencyCode: GulfCurrencyCode = 'BHD',
  convertFromBhd = false,
  showCode = true
): string {
  const { code, digits } = formatAppCurrencyParts(amount, currencyCode, convertFromBhd);
  return showCode ? `${code} ${digits}` : digits;
}
