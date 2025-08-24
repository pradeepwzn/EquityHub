'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Progress, Space, Button } from 'antd';
import { ClockCircleOutlined, RocketOutlined, WarningOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  memoryUsage?: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
        const largestContentfulPaint = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
        
        // Estimate time to interactive (simplified)
        const timeToInteractive = Math.max(pageLoadTime, firstContentfulPaint + 1000);
        
        // Get memory usage if available
        let memoryUsage: number | undefined;
        if ('memory' in performance) {
          memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        }

        setMetrics({
          pageLoadTime,
          firstContentfulPaint,
          largestContentfulPaint,
          timeToInteractive,
          memoryUsage
        });
      }
    };

    // Measure after a short delay to ensure page is loaded
    const timer = setTimeout(measurePerformance, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!metrics || process.env.NODE_ENV !== 'development') return null;

  const getPerformanceColor = (time: number) => {
    if (time < 1000) return '#16a34a'; // Green
    if (time < 3000) return '#f59e0b'; // Yellow
    return '#dc2626'; // Red
  };

  const getPerformanceStatus = (time: number) => {
    if (time < 1000) return 'Excellent';
    if (time < 3000) return 'Good';
    if (time < 5000) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card 
        size="small" 
        className="shadow-lg border-0 rounded-xl bg-white/95 backdrop-blur-sm"
        style={{ width: 300 }}
        title={
          <div className="flex items-center space-x-2">
            <RocketOutlined className="text-blue-600" />
            <Text className="font-medium">Performance Monitor</Text>
          </div>
        }
        extra={
          <Button 
            size="small" 
            type="text" 
            onClick={() => setIsVisible(!isVisible)}
            className="text-slate-500 hover:text-slate-700"
          >
            {isVisible ? 'Hide' : 'Show'}
          </Button>
        }
      >
        {isVisible && (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Text className="text-xs text-slate-600">Page Load Time</Text>
                <Text className="text-xs font-medium" style={{ color: getPerformanceColor(metrics.pageLoadTime) }}>
                  {metrics.pageLoadTime.toFixed(0)}ms
                </Text>
              </div>
              <Progress 
                percent={Math.min((metrics.pageLoadTime / 5000) * 100, 100)} 
                size="small" 
                strokeColor={getPerformanceColor(metrics.pageLoadTime)}
                showInfo={false}
              />
              <Text className="text-xs text-slate-500">{getPerformanceStatus(metrics.pageLoadTime)}</Text>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Text className="text-xs text-slate-600">First Paint</Text>
                <Text className="text-xs font-medium">
                  {metrics.firstContentfulPaint.toFixed(0)}ms
                </Text>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Text className="text-xs text-slate-600">Largest Paint</Text>
                <Text className="text-xs font-medium">
                  {metrics.largestContentfulPaint.toFixed(0)}ms
                </Text>
              </div>
            </div>

            {metrics.memoryUsage && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Text className="text-xs text-slate-600">Memory Usage</Text>
                  <Text className="text-xs font-medium">
                    {metrics.memoryUsage.toFixed(1)}MB
                  </Text>
                </div>
              </div>
            )}

            {metrics.pageLoadTime > 3000 && (
              <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg border border-red-200">
                <WarningOutlined className="text-red-500" />
                <Text className="text-xs text-red-700">
                  Page load time is high. Consider optimizing components.
                </Text>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PerformanceMonitor;

