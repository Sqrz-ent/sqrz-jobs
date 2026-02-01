import { useEffect, useState } from "react";

const COOKIE_NAME = "sqrz_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith(`${COOKIE_NAME}=`));

    if (!hasCookie) setVisible(true);
  }, []);

  const setConsent = (analytics: boolean, marketing: boolean) => {
    const value = encodeURIComponent(
      JSON.stringify({
        analytics,
        marketing,
        timestamp: Date.now(),
      })
    );

    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000`;
    setVisible(false);

    // Reload so AnalyticsGate runs with consent
    window.location.reload();
  };

  if (!visible) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <p style={{ marginBottom: 12 }}>
          We use cookies for analytics and marketing to improve your experience.
        </p>

        <div style={styles.buttons}>
          <button onClick={() => setConsent(true, true)} style={styles.accept}>
            Accept all
          </button>

          <button onClick={() => setConsent(true, false)} style={styles.analytics}>
            Analytics only
          </button>

          <button onClick={() => setConsent(false, false)} style={styles.decline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    bottom: 20,
    left: 20,
    right: 20,
    display: "flex",
    justifyContent: "center",
    zIndex: 9999,
  },
  box: {
    maxWidth: 520,
    background: "#111",
    color: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    fontSize: 14,
  },
  buttons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  accept: {
    background: "#f3b130",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  analytics: {
    background: "#333",
    color: "#fff",
    border: "1px solid #555",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  decline: {
    background: "transparent",
    color: "#aaa",
    border: "1px solid #444",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
};
