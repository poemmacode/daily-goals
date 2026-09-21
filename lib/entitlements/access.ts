import { Feature, Tier, TIER_FEATURES, FREE_UPGRADE_MESSAGES } from "./features";

/**
 * Check if a user with the given tier can use a feature.
 */
export function canUseFeature(tier: Tier, feature: Feature): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false;
}

/**
 * Get the upgrade message for a locked feature.
 * Returns null if the feature is available.
 */
export function getUpgradeMessage(tier: Tier, feature: Feature): string | null {
  if (canUseFeature(tier, feature)) return null;
  return FREE_UPGRADE_MESSAGES[feature] ?? "This feature requires Pro.";
}

/**
 * Get all features available for a tier.
 */
export function getAvailableFeatures(tier: Tier): Feature[] {
  return TIER_FEATURES[tier] ?? TIER_FEATURES.free;
}

/**
 * Get all features locked for a tier.
 */
export function getLockedFeatures(tier: Tier): Feature[] {
  const available = new Set(getAvailableFeatures(tier));
  return Object.values(Feature).filter((f) => !available.has(f));
}

/**
 * Development helper: toggle tier for testing.
 * In production, tier comes from the database.
 */
export function getDevTier(): Tier {
  if (typeof window === "undefined") return "free";
  try {
    return (localStorage.getItem("dg:tier") as Tier) || "free";
  } catch {
    return "free";
  }
}

export function setDevTier(tier: Tier): void {
  try {
    localStorage.setItem("dg:tier", tier);
  } catch {
    // localStorage unavailable
  }
}
