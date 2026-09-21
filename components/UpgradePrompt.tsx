"use client";

import { Feature, type Tier } from "@/lib/entitlements/features";
import { canUseFeature, getUpgradeMessage, setDevTier } from "@/lib/entitlements/access";
import { useLang } from "@/lib/i18n";

interface UpgradePromptProps {
  tier: Tier;
  feature: Feature;
  children: React.ReactNode;
}

/**
 * Wraps content that requires a specific feature.
 * If the feature is locked, shows an upgrade prompt instead.
 */
export function UpgradePrompt({ tier, feature, children }: UpgradePromptProps) {
  const { t } = useLang();

  if (canUseFeature(tier, feature)) {
    return <>{children}</>;
  }

  const message = getUpgradeMessage(tier, feature);

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-zinc-950/80">
        <div className="text-center p-4">
          <div className="mb-2 text-2xl">🔒</div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {message ?? "This feature requires Pro."}
          </p>
          <button
            onClick={() => {
              setDevTier("pro");
              window.location.reload();
            }}
            className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {t.settings?.upgradeToPro ?? "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FeatureGateProps {
  tier: Tier;
  feature: Feature;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders content based on feature access.
 * Shows fallback (or nothing) if feature is locked.
 */
export function FeatureGate({ tier, feature, fallback, children }: FeatureGateProps) {
  if (canUseFeature(tier, feature)) {
    return <>{children}</>;
  }
  return <>{fallback ?? null}</>;
}
