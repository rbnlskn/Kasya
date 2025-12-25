import useWindowSize from './useWindowSize';

const BASE_WIDTH = 390; // Base width for scaling calculations

const useResponsiveScaling = () => {
  const { width } = useWindowSize();
  if (width === 0) {
    return { scale: 1 }; // Return a default scale of 1 if width is not yet available
  }
  const scale = width / BASE_WIDTH;

  return { scale };
};

export default useResponsiveScaling;
