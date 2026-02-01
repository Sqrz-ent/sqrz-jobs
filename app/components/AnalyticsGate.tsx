import { useEffect } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export default function AnalyticsGate() {
  const {
    isReady,
    hasAnalyticsConsent,
    hasMarketingConsent,
  } = useCookieConsent();

  const GA_ID = "G-CK55029FEL";
  const FB_PIXEL_ID = "210321700824962";
  const HUBSPOT_ID = "8081234";
  const LINKEDIN_ID = "2800882";

  useEffect(() => {
    if (!isReady) return;

    // Prevent double injection
    if (document.getElementById("sqrz-analytics-loaded")) return;
    const marker = document.createElement("div");
    marker.id = "sqrz-analytics-loaded";
    document.body.appendChild(marker);

    // --- Analytics consent (GA + HubSpot) ---
    if (hasAnalyticsConsent) {
      // Google Analytics
      const gaScript = document.createElement("script");
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      gaScript.async = true;
      document.head.appendChild(gaScript);

      const gaInit = document.createElement("script");
      gaInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: true });
      `;
      document.head.appendChild(gaInit);

      // HubSpot
      const hsScript = document.createElement("script");
      hsScript.src = `https://js.hs-scripts.com/${HUBSPOT_ID}.js`;
      hsScript.async = true;
      document.head.appendChild(hsScript);
    }

    // --- Marketing consent (Meta + LinkedIn) ---
    if (hasMarketingConsent) {
      // Meta Pixel
      const fbScript = document.createElement("script");
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s){
          if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      // LinkedIn Insight Tag
      const liScript = document.createElement("script");
      liScript.innerHTML = `
        _linkedin_partner_id = "${LINKEDIN_ID}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);

        (function(l) {
          if (!l){
            window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]
          }
          var s = document.getElementsByTagName("script")[0];
          var b = document.createElement("script");
          b.type = "text/javascript";
          b.async = true;
          b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
          s.parentNode.insertBefore(b, s);
        })(window.lintrk);
      `;
      document.head.appendChild(liScript);
    }

  }, [isReady, hasAnalyticsConsent, hasMarketingConsent]);

  if (!isReady) return null;

  return null;
}
