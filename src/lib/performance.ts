// Performance optimization utilities
import React from 'react';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Debounce function to limit function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit function execution frequency
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cache = new Map<string, any>();
  private maxCacheSize = 100;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

// Lazy loading utility
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType<any>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

// Performance monitoring (browser-only)
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number[]>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => void {
    if (!isBrowser || !performance) {
      return () => {}; // No-op for server-side
    }
    
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // Log slow operations
      if (duration > 100) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Intersection Observer for lazy loading (browser-only)
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (!isBrowser || !window.IntersectionObserver) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
}

// Virtual scrolling utilities
export function createVirtualScroller<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(0 / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil(containerHeight / itemHeight) + overscan
  );

  return {
    startIndex,
    endIndex,
    visibleItems: items.slice(startIndex, endIndex),
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

// Bundle size optimization
export const bundleOptimizations = {
  // Tree shaking helpers
  only: <T>(value: T): T => value,
  
  // Dynamic import with error boundary
  dynamicImport: async <T>(
    importFunc: () => Promise<T>,
    fallback?: T
  ): Promise<T> => {
    try {
      return await importFunc();
    } catch (error) {
      console.error('Dynamic import failed:', error);
      if (fallback !== undefined) {
        return fallback;
      }
      throw error;
    }
  }
};

// Memory leak prevention (browser-only)
export function preventMemoryLeaks() {
  if (!isBrowser) {
    return () => {}; // No-op for server-side
  }
  
  // Clean up event listeners
  const cleanup = () => {
    // Remove any global event listeners
    window.removeEventListener('beforeunload', cleanup);
  };
  
  window.addEventListener('beforeunload', cleanup);
  
  return cleanup;
}

// Performance budget monitoring
export class PerformanceBudget {
  private static instance: PerformanceBudget;
  private budgets = new Map<string, number>();

  static getInstance(): PerformanceBudget {
    if (!PerformanceBudget.instance) {
      PerformanceBudget.instance = new PerformanceBudget();
    }
    return PerformanceBudget.instance;
  }

  setBudget(metric: string, threshold: number): void {
    this.budgets.set(metric, threshold);
  }

  checkBudget(metric: string, value: number): boolean {
    const threshold = this.budgets.get(metric);
    if (threshold === undefined) return true;
    
    const isWithinBudget = value <= threshold;
    if (!isWithinBudget) {
      console.warn(`Performance budget exceeded: ${metric} = ${value} (threshold: ${threshold})`);
    }
    
    return isWithinBudget;
  }
}

export default {
  debounce,
  throttle,
  MemoryManager,
  PerformanceMonitor,
  createIntersectionObserver,
  createVirtualScroller,
  bundleOptimizations,
  preventMemoryLeaks,
  PerformanceBudget
};
