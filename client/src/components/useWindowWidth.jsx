// src/components/useWindowWidth.jsx

import { useState, useEffect } from "react";

export function useWindowWidth() {
  // 👇 This line is critical. It must get the width *immediately*.
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures this runs only once

  return width;
}