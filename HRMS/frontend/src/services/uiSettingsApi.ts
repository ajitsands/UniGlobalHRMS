export interface GlobalUiSettingsPayload {
  themeMode: 'uniglobal-light' | 'single' | 'gradient';
  primaryColor: string;
  gradientId: string;
  menuLayout: 'vertical' | 'horizontal' | 'docking' | 'minimal';
  menuSticky: boolean;
  isMenuLocked: boolean;
  menuOrder: string[];
  quickAccessIds: string[];

  headerFooterStyle: 'light' | 'single' | 'gradient';
  headerFooterColor: string;
  hfTextColor: string;
  hfGradStart: string;
  hfGradEnd: string;
  hfGradAngle: number;

  menuBgStyle: 'light' | 'single' | 'gradient';
  menuBgColor: string;
  menuTextColor: string;
  menuGradStart: string;
  menuGradEnd: string;
  menuGradAngle: number;

  language: 'en' | 'ar';
  fontSizePx: number;
  fontFamilyId: string;
  cardShadowLevel: number;
  scrollbarColor: string;

  lockCorporateTheme: boolean;
  updatedBy?: string;
  updatedAtUtc?: string;
}

export async function fetchGlobalUiSettings(): Promise<GlobalUiSettingsPayload | null> {
  try {
    const res = await fetch(`/api/v1/ui-settings?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as GlobalUiSettingsPayload;
  } catch {
    return null;
  }
}

export async function saveGlobalUiSettings(
  payload: GlobalUiSettingsPayload,
  userName = 'SuperAdmin',
  role = 'SuperAdmin'
): Promise<GlobalUiSettingsPayload> {
  const res = await fetch('/api/v1/ui-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
      'X-User-Name': userName,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to save settings (HTTP ${res.status})`);
  }
  return (await res.json()) as GlobalUiSettingsPayload;
}
