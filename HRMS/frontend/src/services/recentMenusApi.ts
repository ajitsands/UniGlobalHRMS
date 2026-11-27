export interface RecentMenuEntry {
  menuId: string;
  label: string;
  labelAr: string;
  parentLabel?: string;
  accessedAtUtc: string;
  visitCount: number;
}

export interface LocalRecentMenusCache {
  userId: string;
  userDisplayName: string;
  items: RecentMenuEntry[];
  dirty: boolean;
  lastSyncedAtUtc?: string;
}

const API_BASE = '/api/v1/recent-menus';
const DEFAULT_MAX_RECENT_ITEMS = 10;

function clampLimit(limit?: number): number {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_RECENT_ITEMS;
  return Math.min(50, Math.max(1, Math.round(n)));
}

function getStorageKey(userId: string): string {
  const clean = (userId || 'ADMIN-01').trim().toUpperCase();
  return `prompt_hrms_recent_menus_v1_${clean}`;
}

export function readLocalRecentCache(
  userId: string,
  displayName = '',
  maxItems = DEFAULT_MAX_RECENT_ITEMS
): LocalRecentMenusCache {
  const cleanId = (userId || 'ADMIN-01').trim().toUpperCase();
  const cap = clampLimit(maxItems);
  try {
    const raw = localStorage.getItem(getStorageKey(cleanId));
    if (!raw) {
      return {
        userId: cleanId,
        userDisplayName: displayName || cleanId,
        items: [],
        dirty: false,
      };
    }
    const parsed = JSON.parse(raw) as LocalRecentMenusCache;
    return {
      userId: cleanId,
      userDisplayName: displayName || parsed.userDisplayName || cleanId,
      items: Array.isArray(parsed.items) ? parsed.items.slice(0, cap) : [],
      dirty: Boolean(parsed.dirty),
      lastSyncedAtUtc: parsed.lastSyncedAtUtc,
    };
  } catch {
    return {
      userId: cleanId,
      userDisplayName: displayName || cleanId,
      items: [],
      dirty: false,
    };
  }
}

function writeLocalRecentCache(cache: LocalRecentMenusCache): void {
  try {
    localStorage.setItem(getStorageKey(cache.userId), JSON.stringify(cache));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * STAGE 1 (ON LOGIN):
 * Fetches the user's recent menus once from SQL Server (capped to SuperAdmin's RecentMenusLimit)
 * and stores them in Local Storage.
 */
export async function hydrateRecentMenusOnLogin(
  userId: string,
  userDisplayName: string,
  maxItems = DEFAULT_MAX_RECENT_ITEMS
): Promise<LocalRecentMenusCache> {
  const cleanId = (userId || 'ADMIN-01').trim().toUpperCase();
  const cap = clampLimit(maxItems);
  const local = readLocalRecentCache(cleanId, userDisplayName, cap);

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(cleanId)}?_t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return local;

    const remote = (await res.json()) as {
      userId: string;
      userDisplayName: string;
      items: RecentMenuEntry[];
      updatedAtUtc?: string;
    };
    const remoteItems = Array.isArray(remote.items) ? remote.items : [];

    // If local had unsaved clicks, merge local + remote by menuId and flush back
    if (local.dirty && local.items.length > 0) {
      const mergedMap = new Map<string, RecentMenuEntry>();
      for (const item of [...local.items, ...remoteItems]) {
        const existing = mergedMap.get(item.menuId);
        if (!existing) {
          mergedMap.set(item.menuId, item);
        } else {
          const newer =
            item.accessedAtUtc >= existing.accessedAtUtc ? item : existing;
          mergedMap.set(item.menuId, {
            ...newer,
            visitCount: Math.max(item.visitCount || 1, existing.visitCount || 1),
          });
        }
      }
      const mergedItems = Array.from(mergedMap.values())
        .sort((a, b) => b.accessedAtUtc.localeCompare(a.accessedAtUtc))
        .slice(0, cap);

      const mergedCache: LocalRecentMenusCache = {
        userId: cleanId,
        userDisplayName: userDisplayName || remote.userDisplayName || cleanId,
        items: mergedItems,
        dirty: true,
        lastSyncedAtUtc: remote.updatedAtUtc,
      };
      writeLocalRecentCache(mergedCache);
      return await flushRecentMenusToDb(cleanId, false, cap);
    }

    const hydrated: LocalRecentMenusCache = {
      userId: cleanId,
      userDisplayName: userDisplayName || remote.userDisplayName || cleanId,
      items: remoteItems
        .sort((a, b) => b.accessedAtUtc.localeCompare(a.accessedAtUtc))
        .slice(0, cap),
      dirty: false,
      lastSyncedAtUtc: remote.updatedAtUtc || new Date().toISOString(),
    };
    writeLocalRecentCache(hydrated);
    return hydrated;
  } catch {
    return local;
  }
}

/**
 * STAGE 2 (ON MENU ACCESS — LOCAL ONLY, 0 DB CALLS):
 * Updates Local Storage instantaneously (< 1 ms) with the latest Date & Time stamp,
 * deduplicating by menuId and strictly capping at SuperAdmin's configured RecentMenusLimit.
 */
export function recordMenuAccessLocal(
  userId: string,
  userDisplayName: string,
  menu: { menuId: string; label: string; labelAr: string; parentLabel?: string },
  maxItems = DEFAULT_MAX_RECENT_ITEMS
): LocalRecentMenusCache {
  const cleanId = (userId || 'ADMIN-01').trim().toUpperCase();
  const cap = clampLimit(maxItems);
  const current = readLocalRecentCache(cleanId, userDisplayName, 50);
  const existing = current.items.find((i) => i.menuId === menu.menuId);

  const updatedEntry: RecentMenuEntry = {
    menuId: menu.menuId,
    label: menu.label,
    labelAr: menu.labelAr,
    parentLabel: menu.parentLabel,
    accessedAtUtc: new Date().toISOString(),
    visitCount: (existing?.visitCount ?? 0) + 1,
  };

  const remaining = current.items.filter((i) => i.menuId !== menu.menuId);
  const nextItems = [updatedEntry, ...remaining].slice(0, cap);

  const nextCache: LocalRecentMenusCache = {
    userId: cleanId,
    userDisplayName: userDisplayName || current.userDisplayName || cleanId,
    items: nextItems,
    dirty: true,
    lastSyncedAtUtc: current.lastSyncedAtUtc,
  };

  writeLocalRecentCache(nextCache);
  return nextCache;
}

/**
 * STAGE 3 (ON IDLE / TAB HIDE / WINDOW CLOSE / SIGN-OUT):
 * Batch-flushes the user's recent menus from Local Storage to SQL Server in one call.
 */
export async function flushRecentMenusToDb(
  userId: string,
  useKeepalive = false,
  maxItems = DEFAULT_MAX_RECENT_ITEMS
): Promise<LocalRecentMenusCache> {
  const cleanId = (userId || 'ADMIN-01').trim().toUpperCase();
  const cap = clampLimit(maxItems);
  const current = readLocalRecentCache(cleanId, '', cap);
  if (!current.dirty) return current;

  const payload = {
    userId: current.userId,
    userDisplayName: current.userDisplayName,
    items: current.items.slice(0, cap),
  };

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(cleanId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: useKeepalive,
    });

    if (res.ok) {
      const savedDto = (await res.json()) as { items?: RecentMenuEntry[] };
      const synced: LocalRecentMenusCache = {
        ...current,
        items: Array.isArray(savedDto.items) ? savedDto.items.slice(0, cap) : current.items.slice(0, cap),
        dirty: false,
        lastSyncedAtUtc: new Date().toISOString(),
      };
      writeLocalRecentCache(synced);
      return synced;
    }
  } catch {
    // Keep dirty = true in localStorage so next idle/login retries automatically
  }

  return current;
}

/**
 * Clears the user's recent menu list in both Local Storage and SQL Server.
 */
export async function clearRecentMenusForUser(
  userId: string,
  userDisplayName: string
): Promise<LocalRecentMenusCache> {
  const cleanId = (userId || 'ADMIN-01').trim().toUpperCase();
  const cleared: LocalRecentMenusCache = {
    userId: cleanId,
    userDisplayName: userDisplayName || cleanId,
    items: [],
    dirty: false,
    lastSyncedAtUtc: new Date().toISOString(),
  };
  writeLocalRecentCache(cleared);

  try {
    await fetch(`${API_BASE}/${encodeURIComponent(cleanId)}`, { method: 'DELETE' });
  } catch {
    // ignore offline error
  }

  return cleared;
}
