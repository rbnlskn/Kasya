import { useState, useEffect } from 'react';

const BASELINE_WIDTH = 375; // Standard baseline width for modern mobile devices

const useResponsive = () => {
  const getScaleFactor = () => window.innerWidth / BASELINE_WIDTH;

  const [scaleFactor, setScaleFactor] = useState(getScaleFactor());

  useEffect(() => {
    const updateScaleFactor = () => {
      setScaleFactor(getScaleFactor());
    };

    window.addEventListener('resize', updateScaleFactor);

    return () => {
      window.removeEventListener('resize', updateScaleFactor);
    };
  }, []);

  const scale = (size: number, defaultValue?: number) => {
    if (defaultValue !== undefined) {
      return defaultValue * scaleFactor;
    }
    return Math.round(size * scaleFactor);
  };

  const fontScale = (size: number) => {
    // Use a more subtle scaling for fonts to prevent them from becoming too large or too small
    return Math.round(size * (1 + (scaleFactor - 1) * 0.5));
  };

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    scale,
    fontScale,
    width,
    height,
    scaleFactor,
  };
};

export default useResponsive;
