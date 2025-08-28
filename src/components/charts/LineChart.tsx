'use client';

import React, { useMemo, useCallback } from 'react';
import { Line } from '@ant-design/plots';

interface LineChartProps {
  data: any[];
  xField: string;
  yField: string;
  seriesField: string;
  title: string;
  height: number;
}

const LineChart: React.FC<LineChartProps> = React.memo(({ 
  data, 
  xField, 
  yField, 
  seriesField, 
  title, 
  height 
}) => {
  // Memoize data transformation to prevent unnecessary recalculations
  const transformedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.flatMap(item => {
      const result = [];
      
      // Add founder data
      if (item.founders !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.founders,
          [seriesField]: 'Founders'
        });
      }
      
      // Add investor data
      if (item.investors !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.investors,
          [seriesField]: 'Investors'
        });
      }
      
      // Add ESOP data
      if (item.esop !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.esop,
          [seriesField]: 'ESOP Pool'
        });
      }
      
      // Add available data
      if (item.available !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.available,
          [seriesField]: 'Available'
        });
      }
      
      // Add founder value data
      if (item.founderValue !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.founderValue,
          [seriesField]: 'Founder Value'
        });
      }
      
      // Add investor value data
      if (item.investorValue !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.investorValue,
          [seriesField]: 'Investor Value'
        });
      }
      
      // Add ESOP value data
      if (item.esopValue !== undefined) {
        result.push({
          [xField]: item.round,
          [yField]: item.esopValue,
          [seriesField]: 'ESOP Value'
        });
      }
      
      return result;
    });
  }, [data, xField, yField, seriesField]);

  // Memoize chart configuration to prevent unnecessary re-renders
  const chartConfig = useMemo(() => ({
    data: transformedData,
    xField,
    yField,
    seriesField,
    height,
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 5,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    lineStyle: {
      lineWidth: 3,
    },
    color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC'],
    legend: {
      position: 'top',
      marker: {
        symbol: 'circle',
      },
    },
    grid: {
      line: {
        style: {
          stroke: '#f0f0f0',
          lineWidth: 1,
        },
      },
    },
    tooltip: {
      showMarkers: false,
      showCrosshairs: true,
      crosshairs: {
        type: 'xy',
      },
    },
    xAxis: {
      title: {
        text: 'Funding Round',
        style: {
          fontSize: 14,
          fontWeight: 600,
        },
      },
      label: {
        style: {
          fontSize: 12,
        },
      },
    },
    yAxis: {
      title: {
        text: yField.includes('Value') ? 'Value ($)' : 'Ownership (%)',
        style: {
          fontSize: 14,
          fontWeight: 600,
        },
      },
      label: {
        formatter: (value: string) => {
          if (yField.includes('Value')) {
            return `$${(parseFloat(value) / 1000000).toFixed(1)}M`;
          }
          return `${value}%`;
        },
        style: {
          fontSize: 12,
        },
      },
    },
  }), [transformedData, xField, yField, seriesField, height]);

  // Memoize the formatter function
  const yAxisFormatter = useCallback((value: string) => {
    if (yField.includes('Value')) {
      return `$${(parseFloat(value) / 1000000).toFixed(1)}M`;
    }
    return `${value}%`;
  }, [yField]);

  // Early return for empty data
  if (!transformedData || transformedData.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <Line {...chartConfig} />
    </div>
  );
});

LineChart.displayName = 'LineChart';

export default LineChart;

