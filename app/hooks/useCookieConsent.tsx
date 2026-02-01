import { useEffect, useState } from "react";

const COOKIE_NAME = "sqrz_cookie_consent";

export type CookieConsent = {
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));

    if (match) {
      try {
        const value = decodeURIComponent(match.split("=")[1]);
        setConsent(JSON.parse(value));
      } catch {
        setConsent(null);
      }
    }

    setIsReady(true);
  }, []);

  return {
    consent,
    hasAnalyticsConsent: !!consent?.analytics,
    hasMarketingConsent: !!consent?.marketing,
    isReady,
  };
}
