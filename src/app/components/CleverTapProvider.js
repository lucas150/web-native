"use client"; // Ensure this runs only on the client side

import { useEffect } from "react";

export default function CleverTapProvider() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("clevertap-web-sdk").then((clevertap) => {
        clevertap.default.init("TEST-4R8-7ZK-6K7Z", "eu1");
        clevertap.default.privacy.push({ optOut: false });
        clevertap.default.privacy.push({ useIP: false });
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker
            .register("/clevertap_sw.js")
            .then(() => console.log("Service Worker Registered"))
            .catch((error) => console.error("Service Worker Registration failed:", error));
        }
      });
    }
  }, []);

  return null; 
}
