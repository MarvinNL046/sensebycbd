import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

/**
 * Analytics function to send web vitals metrics to an analytics service
 * @param metric The web vitals metric to report
 */
export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
  
  // Send to analytics service in production
  // This could be Google Analytics, Vercel Analytics, or a custom endpoint
  if (process.env.NODE_ENV === 'production') {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      navigationType: metric.navigationType
    });
    
    // Send to our analytics API endpoint
    fetch('/api/analytics', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(error => {
      console.error('Error sending web vitals:', error);
    });
    
    // Example: Send to Google Analytics
    // const analyticsId = 'UA-XXXXX-Y';
    // const event = {
    //   event_category: 'Web Vitals',
    //   event_action: metric.name,
    //   event_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // };
    // window.gtag('event', 'web_vitals', event);
  }
}

/**
 * Measure all web vitals
 */
export function measureWebVitals() {
  onCLS(reportWebVitals);
  onFID(reportWebVitals);
  onLCP(reportWebVitals);
  onFCP(reportWebVitals);
  onTTFB(reportWebVitals);
}
