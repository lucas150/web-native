"use client";

import { useEffect, useState } from "react";

export default function SignedCall() {
  const [signedCallClient, setSignedCallClient] = useState(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dynamically import libraries only on the client side
      import("clevertap-web-sdk")
        .then((clevertap) => {
          return import("clevertap-signed-call").then(({ initSignedCall }) => {
            initSignedCall({
              // accountId: "61a52046f56a14cb19a1e9cc",
              // apikey: "9dcced09dae16c5e3606c22346d92361b77efdb360425913850bea4f22d812dd",
              cuid: "CTHenil",
              clevertap: clevertap.default, // Make sure to access the default export
              name: "CTHenil",
            })
              .then((client) => {
                console.log("Signed Call Web SDK Initialized Successfully", client);
                setSignedCallClient(client);
                setIsSdkLoaded(true);
              })
              .catch((error) => {
                console.error("Signed Call Web SDK Initialization Failed", error);
              });
          });
        })
        .catch((error) => {
          console.error("Error loading SDKs:", error);
        });
    }
  }, []);

  const handleCall = () => {
    if (!signedCallClient) {
      alert("Signed Call Web SDK is not initialized yet.");
      return;
    }

    if (signedCallClient.isEnabled()) {
      signedCallClient
        .call("ct_henil", "Test") // Provide actual receiver ID
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    } else {
      alert("Signed Call services are not enabled.");
    }
  };

  return (
    <div>
      <h2>Signed Call Integration</h2>
      {isSdkLoaded ? (
        <button onClick={handleCall}>📞 Call Now</button>
      ) : (
        <p>Loading Signed Call SDK...</p>
      )}
    </div>
  );
}
