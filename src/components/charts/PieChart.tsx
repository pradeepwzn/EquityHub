'use client';

import React from 'react';
import { Pie } from '@ant-design/plots';

interface PieChartProps {
  data: Array<{
    type: string;
    value: number;
  }>;
  title: string;
  height: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, title, height }) => {
  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    height,
    radius: 0.8,
    innerRadius: 0.4,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    legend: {
      position: 'bottom',
      marker: {
        symbol: 'circle',
      },
      itemHeight: 8,
      itemWidth: 8,
    },
    color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC'],
    statistic: {
      title: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: 'Total',
      },
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '100%',
      },
    },
    animation: {
      appear: {
        animation: 'fade-in',
        duration: 1000,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: datum.type,
          value: `${datum.value.toFixed(2)}%`,
        };
      },
    },
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <Pie {...config} />
    </div>
  );
};

export default PieChart;
