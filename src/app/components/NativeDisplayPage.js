// "use client";

// import React, { useState } from "react";

// const NativeDisplayPage = () => {
//   const [hovered, setHovered] = useState(null);

//   const triggerEvent = (eventName, divId) => {
//     window.clevertap?.event?.push(eventName);

//     window.clevertap?.render?.({
//       targetDivId: divId,
//       onSuccess: () => console.log(`Rendered Native Display in ${divId}`),
//       onFailure: (error) =>
//         console.error(`Failed to render Native Display in ${divId}:`, error),
//     });
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.overlay}>
//         <h1 style={styles.heading}>✨ Native Display Demo ✨</h1>

//         <div style={styles.buttonGroup}>
//           {["CustomEvent1", "CustomEvent2", "CustomEvent3", "CustomEvent4"].map(
//             (eventName, index) => (
//               <button
//                 key={eventName}
//                 onClick={() => triggerEvent(eventName, "ct-display1")}
//                 onMouseEnter={() => setHovered(eventName)}
//                 onMouseLeave={() => setHovered(null)}
//                 style={
//                   hovered === eventName
//                     ? { ...styles.button, ...styles.buttonHover }
//                     : styles.button
//                 }
//               >
//                 Banner with Text {index + 1}
//               </button>
//             )
//           )}
//         </div>

//         <div id="ct-display1" style={styles.displayBox}>
//           {/* CleverTap Native Display will render here */}
//           <p style={styles.placeholderText}>
//             Native Display content will appear here after clicking a button.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   page: {
//     width: "100%",
//     minHeight: "100vh",
//     background: "linear-gradient(to right, #74ebd5, #9face6)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: "2rem",
//     boxSizing: "border-box",
//   },
//   overlay: {
//     width: "100%",
//     // maxWidth: "1200px",
//     padding: "2rem",
//     borderRadius: "20px",
//     backgroundColor: "rgba(255, 255, 255, 0.9)",
//     boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
//   },
//   heading: {
//     fontSize: "3rem",
//     textAlign: "center",
//     marginBottom: "2rem",
//     color: "#333",
//     fontWeight: "700",
//     textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
//   },
//   buttonGroup: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "1rem",
//     justifyContent: "center",
//     marginBottom: "2rem",
//   },
//   button: {
//     backgroundColor: "#5a67d8",
//     border: "none",
//     padding: "0.9rem 1.8rem",
//     borderRadius: "30px",
//     cursor: "pointer",
//     color: "white",
//     fontSize: "1.05rem",
//     fontWeight: "600",
//     transition: "all 0.3s ease",
//     boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
//   },
//   buttonHover: {
//     backgroundColor: "#434190",
//     transform: "translateY(-2px)",
//     boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
//   },
//   displayBox: {
//     border: "2px dashed #c3c3c3",
//     borderRadius: "16px",
//     backgroundColor: "#fff",
//     padding: "1rem",
//     width: "95%",
//     minHeight: "400px",
//     boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//     position: "relative",
//     textAlign: "center",
//   },
//   placeholderText: {
//     color: "#888",
//     fontStyle: "italic",
//     marginTop: "1rem",
//   },
// };

// export default NativeDisplayPage;

"use client";

import React, { useState } from "react";

const NativeDisplayPage = () => {
  const [hovered, setHovered] = useState(null);

  const triggerEvent = (eventName, divId) => {
    window.clevertap?.event?.push(eventName);

    window.clevertap?.render?.({
      targetDivId: divId,
      onSuccess: () => console.log(`Rendered Native Display in ${divId}`),
      onFailure: (error) =>
        console.error(`Failed to render Native Display in ${divId}:`, error),
    });
  };

  const campaigns = [
    { label: "Banner Carousel with Text", eventName: "CustomEvent1" },
    { label: "Banner", eventName: "CustomEvent2" },
    { label: "Banner Carousel", eventName: "CustomEvent3" },
    { label: "Banner with Text", eventName: "CustomEvent4" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.overlay}>
        <h1 style={styles.heading}>✨ Native Display Demo ✨</h1>

        <div style={styles.buttonGroup}>
          {campaigns.map(({ label, eventName }) => (
            <button
              key={eventName}
              onClick={() => triggerEvent(eventName, "ct-display1")}
              onMouseEnter={() => setHovered(eventName)}
              onMouseLeave={() => setHovered(null)}
              style={
                hovered === eventName
                  ? { ...styles.button, ...styles.buttonHover }
                  : styles.button
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.carouselWrapper}>
          <div id="ct-display1" style={styles.displayBox}>
            {/* CleverTap Native Display will render here */}
            <p style={styles.placeholderText}>
              Native Display content will appear here after clicking a button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(to right, #74ebd5, #9face6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    boxSizing: "border-box",
  },
  overlay: {
    width: "100%",
    padding: "2rem",
    borderRadius: "20px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
  },
  heading: {
    fontSize: "3rem",
    textAlign: "center",
    marginBottom: "2rem",
    color: "#333",
    fontWeight: "700",
    textShadow: "1px 1px 3px rgba(0,0,0,0.1)",
  },
  buttonGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    justifyContent: "center",
    marginBottom: "2rem",
  },
  button: {
    backgroundColor: "#5a67d8",
    border: "none",
    padding: "0.9rem 1.8rem",
    borderRadius: "30px",
    cursor: "pointer",
    color: "white",
    fontSize: "1.05rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
  },
  buttonHover: {
    backgroundColor: "#434190",
    transform: "translateY(-2px)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
  },
  carouselWrapper: {
    width: "100%",
    overflowX: "auto",
    paddingBottom: "1rem",
  },
  displayBox: {
    border: "2px dashed #c3c3c3",
    borderRadius: "16px",
    backgroundColor: "#fff",
    padding: "1rem",
    width: "100%",
    minHeight: "400px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
    position: "relative",
    textAlign: "center",
    transition: "transform 0.3s ease",
    animation: "fadeIn 0.6s ease-out",
  },
  placeholderText: {
    color: "#888",
    fontStyle: "italic",
    marginTop: "1rem",
  },
};

export default NativeDisplayPage;
