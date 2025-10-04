import { useState, useEffect } from 'react';

interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  mapHeight: string;
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    mapHeight: '75vh'
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      if (width <= 768) {
        setBreakpoints({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          mapHeight: '55vh'
        });
      } else if (width <= 1024) {
        setBreakpoints({
          isMobile: false,
          isTablet: true,
          isDesktop: false,
          mapHeight: '65vh'
        });
      } else {
        setBreakpoints({
          isMobile: false,
          isTablet: false,
          isDesktop: true,
          mapHeight: '75vh'
        });
      }
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);

    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};
