"use client";

import { useEffect } from "react";

/**
 * Registers the service worker at /sw.js on the client. A registered SW with
 * a fetch handler is what makes the site installable on Android Chrome (the
 * "Install app" prompt). Renders nothing.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Only run the SW in production. In dev it caches build chunks and causes
    // stale content and hydration mismatches while iterating.
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    };

    // Register after load so it doesn't compete with initial page resources.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}
