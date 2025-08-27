// Performance optimization utilities
import React from 'react';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Extend Performance interface to include memory property (Chrome-specific)
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

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

// Enhanced Memory management utilities with LRU cache and memory pressure detection
export class MemoryManager {
  private static instance: MemoryManager;
  private cache = new Map<string, { value: any; timestamp: number; size: number }>();
  private maxCacheSize = 100;
  private maxMemoryUsage = 50 * 1024 * 1024; // 50MB
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  constructor() {
    if (isBrowser) {
      // Start automatic cleanup
      this.startAutoCleanup();
      
      // Monitor memory pressure
      this.monitorMemoryPressure();
    }
  }

  set(key: string, value: any, ttl?: number): void {
    const size = this.estimateSize(value);
    
    // Check memory pressure before adding
    if (this.isMemoryPressure() && !this.cache.has(key)) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      size
    });
    
    // Set TTL if provided
    if (ttl) {
      setTimeout(() => this.delete(key), ttl);
    }
    
    // Enforce cache size limit
    if (this.cache.size > this.maxCacheSize) {
      this.evictOldest();
    }
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (item) {
      // Update timestamp for LRU behavior
      item.timestamp = Date.now();
      return item.value;
    }
    return undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }

  getMemoryUsage(): number {
    let totalSize = 0;
    this.cache.forEach((item) => {
      totalSize += item.size;
    });
    return totalSize;
  }

  private estimateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 1024; // Default size if estimation fails
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    this.cache.forEach((item, key) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private isMemoryPressure(): boolean {
    if (!isBrowser || !(performance as PerformanceWithMemory).memory) return false;
    
    const memory = (performance as PerformanceWithMemory).memory!;
    const used = memory.usedJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    
    return used > limit * 0.8; // 80% threshold
  }

  private startAutoCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30000); // Cleanup every 30 seconds
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > maxAge) {
        this.cache.delete(key);
      }
    });
  }

  private monitorMemoryPressure(): void {
    if (!isBrowser || !(performance as PerformanceWithMemory).memory) return;
    
    setInterval(() => {
      if (this.isMemoryPressure()) {
        console.warn('Memory pressure detected, cleaning up cache');
        this.clear();
      }
    }, 10000); // Check every 10 seconds
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Lazy loading utility with error boundary
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType<any>
): React.LazyExoticComponent<T> {
  return React.lazy(() => 
    importFunc().catch(() => {
      if (fallback) {
        return { default: fallback as T };
      }
      throw new Error('Failed to load component');
    })
  ) as React.LazyExoticComponent<T>;
}

// Enhanced Performance monitoring with memory tracking
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, number[]>();
  private memorySnapshots: number[] = [];

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

  takeMemorySnapshot(): void {
    if (isBrowser && (performance as PerformanceWithMemory).memory) {
      const memory = (performance as PerformanceWithMemory).memory!;
      this.memorySnapshots.push(memory.usedJSHeapSize);
      
      // Keep only last 100 snapshots
      if (this.memorySnapshots.length > 100) {
        this.memorySnapshots.shift();
      }
    }
  }

  getMemoryTrend(): { current: number; average: number; trend: 'increasing' | 'decreasing' | 'stable' } {
    if (this.memorySnapshots.length < 2) {
      return { current: 0, average: 0, trend: 'stable' };
    }
    
    const current = this.memorySnapshots[this.memorySnapshots.length - 1];
    const previous = this.memorySnapshots[this.memorySnapshots.length - 2];
    const average = this.memorySnapshots.reduce((sum, val) => sum + val, 0) / this.memorySnapshots.length;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (current > previous * 1.1) trend = 'increasing';
    else if (current < previous * 0.9) trend = 'decreasing';
    
    return { current, average, trend };
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.memorySnapshots = [];
  }
}

// Intersection Observer for lazy loading with enhanced options
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

// Virtual scrolling utilities with performance optimizations
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

// Enhanced Bundle size optimization with dynamic imports
export const bundleOptimizations = {
  // Tree shaking helpers
  only: <T>(value: T): T => value,
  
  // Dynamic import with error boundary and retry logic
  dynamicImport: async <T>(
    importFunc: () => Promise<T>,
    fallback?: T,
    retries: number = 3
  ): Promise<T> => {
    for (let i = 0; i < retries; i++) {
    try {
      return await importFunc();
    } catch (error) {
        console.error(`Dynamic import failed (attempt ${i + 1}/${retries}):`, error);
        if (i === retries - 1) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Dynamic import failed after all retries');
  },

  // Preload critical chunks
  preloadChunk: (chunkName: string): void => {
    if (isBrowser) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/_next/static/chunks/${chunkName}.js`;
      document.head.appendChild(link);
    }
  }
};

// Enhanced Memory leak prevention with comprehensive cleanup
export function preventMemoryLeaks() {
  if (!isBrowser) {
    return () => {}; // No-op for server-side
  }
  
  const cleanupTasks: (() => void)[] = [];
  
  // Clean up event listeners
  const cleanup = () => {
    cleanupTasks.forEach(task => task());
    cleanupTasks.length = 0;
    
    // Remove global event listeners
    window.removeEventListener('beforeunload', cleanup);
    window.removeEventListener('pagehide', cleanup);
  };
  
  // Add cleanup tasks
  const addCleanupTask = (task: () => void) => {
    cleanupTasks.push(task);
  };
  
  // Global event listeners
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('pagehide', cleanup);
  
  return { cleanup, addCleanupTask };
}

// Enhanced Performance budget monitoring with alerts
export class PerformanceBudget {
  private static instance: PerformanceBudget;
  private budgets = new Map<string, number>();
  private violations = new Map<string, number[]>();

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
      // Track violations
      if (!this.violations.has(metric)) {
        this.violations.set(metric, []);
      }
      this.violations.get(metric)!.push(value);
      
      console.warn(`Performance budget exceeded: ${metric} = ${value} (threshold: ${threshold})`);
      
      // Alert if too many violations
      const violations = this.violations.get(metric)!;
      if (violations.length > 5) {
        console.error(`Critical: ${metric} has exceeded budget ${violations.length} times`);
      }
    }
    
    return isWithinBudget;
  }

  getViolations(metric: string): number[] {
    return this.violations.get(metric) || [];
  }

  clearViolations(metric?: string): void {
    if (metric) {
      this.violations.delete(metric);
    } else {
      this.violations.clear();
    }
  }
}

// New: Resource preloading utility
export function preloadResource(url: string, type: 'script' | 'style' | 'image'): void {
  if (!isBrowser) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    case 'image':
      link.as = 'image';
      break;
  }
  
  document.head.appendChild(link);
}

// New: Debounced resize handler for performance
export function createDebouncedResizeHandler(
  callback: () => void,
  delay: number = 150
): () => void {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
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
  PerformanceBudget,
  preloadResource,
  createDebouncedResizeHandler
};
