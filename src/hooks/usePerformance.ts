import { useCallback, useRef, useEffect, useState } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  const measurePerformance = useCallback(() => {
    const startTime = performance.now();
    
    // Measure memory usage if available
    let memoryUsage = 0;
    if ('memory' in performance) {
      memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }

    // Count React components (approximate)
    const componentCount = document.querySelectorAll('[data-reactroot], [data-reactid]').length;

    // Measure render time
    const renderTime = performance.now() - startTime;

    setMetrics({
      renderTime: Math.round(renderTime),
      memoryUsage,
      componentCount
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(measurePerformance, 2000);
    return () => clearInterval(interval);
  }, [measurePerformance]);

  return { metrics, measurePerformance };
};




