/**
 * Gyroscope opt-in (docs/DESIGN.md §5.5).
 *
 * Depuis iOS 13, `DeviceOrientationEvent.requestPermission()` doit être
 * appelé DANS un gestionnaire de clic. On ne demande donc plus la permission
 * au premier clic n'importe où : l'utilisateur clique explicitement sur
 * « Incliner avec le téléphone ».
 */

interface DeviceOrientationWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/** Vrai si l'appareil peut fournir une orientation (téléphone / tablette). */
export function hasGyroscope(): boolean {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
    return false;
  }
  // Sur ordinateur, l'API existe mais inutile : on limite aux écrans tactiles.
  return navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Demande l'accès au gyroscope.
 * @returns `true` si l'inclinaison peut être utilisée.
 */
export async function requestGyroscopePermission(): Promise<boolean> {
  if (!hasGyroscope()) return false;

  const deviceOrientation = window.DeviceOrientationEvent as unknown as
    | DeviceOrientationWithPermission
    | undefined;

  // Android et navigateurs de bureau : pas de permission explicite.
  if (typeof deviceOrientation?.requestPermission !== "function") return true;

  try {
    return (await deviceOrientation.requestPermission()) === "granted";
  } catch {
    return false;
  }
}
