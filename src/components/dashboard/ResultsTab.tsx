'use client';

import React, { useMemo, useCallback, useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import { Company, Founder, FundingRound, ExitResults } from '@/types';

interface ResultsTabProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
  onSetExitValue: (value: number) => void;
  onSetESOPAllocation: (allocation: number) => void;
}

// Memoized component to prevent unnecessary re-renders
const ResultsTab = React.memo(({ company, founders, fundingRounds, onSetExitValue, onSetESOPAllocation }: ResultsTabProps) => {
  const [exitValue, setExitValue] = useState(10000000);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleExitValueChange = useCallback((value: number) => {
    setExitValue(value);
    onSetExitValue(value);
  }, [onSetExitValue]);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="flex items-center p-6 sm:p-8 lg:p-10 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6">
            <CalculatorOutlined className="text-3xl text-white" />
          </div>
          <div>
            <Typography.Title level={3} className="mb-2 text-slate-800">
              Exit Scenario Calculator
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-base">
              Model different exit scenarios and analyze ownership dilution
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <div>
              <Typography.Title level={4} className="mb-4 text-slate-700">
                Exit Value
              </Typography.Title>
              <div className="space-y-4">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => handleExitValueChange(10000000)}
                  className="w-full h-14 text-base rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  $10M Exit
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => handleExitValueChange(100000000)}
                  className="w-full h-14 text-base rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  $100M Exit
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => handleExitValueChange(1000000000)}
                  className="w-full h-14 text-base rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  $1B Exit
                </Button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl">
              <Typography.Title level={4} className="mb-3 text-slate-700">
                Current Exit Value
              </Typography.Title>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${exitValue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  Exit Value
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

ResultsTab.displayName = 'ResultsTab';

export default ResultsTab;

