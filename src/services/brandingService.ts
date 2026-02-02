// Branding service to manage customer branding settings
export interface BrandingSettings {
  customerId: number;
  customerName: string;
  customerLogo: string | null;
  brandingOption: "customer" | "excelsoft" | "both";
}

const BRANDING_KEY = "current_branding";

export const brandingService = {
  // Get current branding settings
  getCurrentBranding(): BrandingSettings | null {
    const stored = localStorage.getItem(BRANDING_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Set branding settings
  setBranding(settings: BrandingSettings): void {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(settings));
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent("brandingChanged", { detail: settings }));
  },

  // Clear branding settings
  clearBranding(): void {
    localStorage.removeItem(BRANDING_KEY);
    window.dispatchEvent(new CustomEvent("brandingChanged", { detail: null }));
  },

  // Subscribe to branding changes
  subscribe(callback: (settings: BrandingSettings | null) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<BrandingSettings | null>;
      callback(customEvent.detail);
    };
    window.addEventListener("brandingChanged", handler);
    return () => window.removeEventListener("brandingChanged", handler);
  }
};
