"use client"; // Ensure this runs on the client side only

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/clevertap_sw.js") // Register the service worker
        .then((registration) => {
          console.log("Service Worker Registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker Registration failed:", error);
        });
    }
  }, []);

  return null; // This component doesn't render anything
}
