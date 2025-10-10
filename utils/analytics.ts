// src/lib/analytics.ts
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = "G-1HDDRKXW57"; // 从 Astro 环境变量读取

export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const trackEvent = (
  action: string,
  params: Record<string, string | number | undefined | null> = {}
) => {
  console.log('trackEvent', action, params);
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    ReactGA.event(action, params);
  }
};