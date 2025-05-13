"use client";
import { useEffect, useState } from "react";
const clevertap = typeof window !== "undefined" ? require("clevertap-web-sdk") : null;

export default function CleverTapIntegration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [membership, setMembership] = useState("");
  const [message, setMessage] = useState("");
  const [customNotificationEnabled, setCustomNotificationEnabled] = useState(false);

  useEffect(() => {
    // Initialize CleverTap
    clevertap.init("TEST-4R8-7ZK-6K7Z", "eu1");
    clevertap.privacy.push({ optOut: false });
    clevertap.privacy.push({ useIP: false });

    // Ask for permission but don't register service worker yet
    clevertap.notifications.push({
      titleText: "Would you like to receive Push Notifications?",
      bodyText: "We promise to only send you relevant updates and offers.",
      okButtonText: "Allow",
      rejectButtonText: "No, Thanks",
      okButtonColor: "#F28046",
      serviceWorkerPath: "/clevertap_sw.js",
      onSuccess: function () {
        console.log("User granted notification permission");
        registerServiceWorker();
      },
      onFailure: function () {
        console.log("User denied notification permission");
      },
    });
  }, []);

  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/clevertap_sw.js")
        .then(() => console.log("Service Worker Registered"))
        .catch((error) => console.error("Service Worker Registration failed:", error));
    }
  };

  useEffect(() => {
    if (customNotificationEnabled) {
      clevertap.notificationCallback = function (msg) {
        console.log("Custom Notification Callback called");
        console.log(JSON.stringify(msg));
        setMessage("Custom Notification Received!");
      };
    } else {
      clevertap.notificationCallback = null;
      setMessage("");
    }
  }, [customNotificationEnabled]);

  const submitForm = () => {
    if (!name || !email || !membership) {
      alert("Please fill in all fields!");
      return;
    }

    clevertap.onUserLogin.push({
      Site: {
        name,
        email,
        identity: email,
        membership_type: membership,
        test: "hello",
      },
    });

    setMessage("User details submitted to CleverTap!");
  };

  const triggerEvent = (eventName) => {
    clevertap.event.push(eventName);
  };

  const logout = () => {
    clevertap.logout();
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });

    setName("");
    setEmail("");
    setMembership("");
    setCustomNotificationEnabled(false);
    setMessage("User logged out.");
    alert("User logged out.");
  };

  return (
    <div className="container">
      <h1>User Registration</h1>
      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="text" placeholder="Membership Type" value={membership} onChange={(e) => setMembership(e.target.value)} />
      <button onClick={submitForm}>Submit</button>
      <button onClick={() => triggerEvent("Push Notification Triggered")}>Trigger Push</button>
      <button onClick={() => triggerEvent("BoxPopup")}>Trigger Box Popup</button>
      <button onClick={() => triggerEvent("Banner Popup")}>Trigger Banner</button>
      <button onClick={() => triggerEvent("Interstitial Popup")}>Trigger Interstitial</button>
      <button onClick={() => triggerEvent("Web Exit Intent")}>Trigger Web Exit Intent</button>
      <button onClick={() => triggerEvent("Web Event")}>Show Native Display</button>
      <button onClick={() => clevertap.event.push("Charged", {
    "Amount": 300,
    "Payment mode": "Credit Card",
    "Charged ID": 24052013,
    "Items": [
        {
            "Category": "Books",
            "Book name": "The Millionaire next door",
            "Quantity": 1
        },
        {
            "Category": "Books",
            "Book name": "Achieving inner zen",
            "Quantity": 1
        },
        {
            "Category": "Books",
            "Book name": "Chuck it, let's do it",
            "Quantity": 5
        }
    ]
})}>Charged</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => setCustomNotificationEnabled(true)}>Customize</button>
      <button onClick={() => setCustomNotificationEnabled(false)}>DeCustomize</button>
      <p>{message}</p>
      <div id="ct-nativedisplay" style={{ border: "1px solid #ccc", padding: "10px", marginTop: "20px", width: "400px", height: "400px" }}>
        {/* Native Display content will be rendered here */}
      </div>
    </div>
  );
}
