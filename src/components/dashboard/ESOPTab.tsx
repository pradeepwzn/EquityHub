'use client';

import React, { useMemo, useState, useEffect, Suspense, lazy } from 'react';
import { Card, Typography, Progress, Row, Col, Statistic, InputNumber, Alert, Divider, Tag } from 'antd';
import { TeamOutlined, DollarOutlined, PieChartOutlined, CalculatorOutlined, InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Company, Founder, FundingRound, ExitResults } from '@/types';

const { Title, Text } = Typography;

// Lazy load heavy components
const LazyCard = lazy(() => Promise.resolve({ default: Card }));
const LazyStatistic = lazy(() => Promise.resolve({ default: Statistic }));
const LazyProgress = lazy(() => Promise.resolve({ default: Progress }));

interface ESOPTabProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
}

interface EmployeeESOP {
  name: string;
  shares: number;
  ownershipPercent: number;
  currentValue: number;
  exitValue: number;
  vestingSchedule: string;
  strikePrice: number;
}

// Ultra-optimized calculation functions
const calculateTotalShares = (array: any[], key: string): number => {
  if (!array?.length) return 0;
  let sum = 0;
  const len = array.length;
  for (let i = 0; i < len; i++) {
    sum += array[i][key] || 0;
  }
  return sum;
};

const ESOPTab: React.FC<ESOPTabProps> = React.memo(({ company, founders, fundingRounds, exitResults }) => {
  const [employeeShares, setEmployeeShares] = useState<number>(10000);
  const [employeeName, setEmployeeName] = useState<string>('Employee');
  
  // Ultra-fast calculations with minimal overhead
  const totalFounderShares = useMemo(() => 
    calculateTotalShares(founders, 'shares'), 
    [founders?.length]
  );
  
  const totalRoundShares = useMemo(() => 
    calculateTotalShares(fundingRounds, 'shares_issued'), 
    [fundingRounds?.length]
  );

  // Calculate ESOP pool statistics with lazy loading and early returns
  const esopStats = useMemo(() => {
    if (!company?.total_shares) return null;

    const totalShares = company.total_shares;
    const esopPoolPercent = company.esop_pool || 10;
    const esopShares = Math.floor((totalShares * esopPoolPercent) / 100);
    
    // Use memoized values to prevent recalculation
    const totalAllocatedShares = totalFounderShares + totalRoundShares;
    
    // Calculate available shares for ESOP
    const availableShares = Math.max(0, totalShares - totalAllocatedShares);
    const allocatedESOPShares = Math.min(esopShares, availableShares);
    
    return {
      totalShares,
      esopPoolPercent,
      esopShares,
      allocatedESOPShares,
      availableShares,
      totalAllocatedShares,
      remainingESOPShares: Math.max(0, esopShares - allocatedESOPShares)
    };
  }, [company?.total_shares, company?.esop_pool, totalFounderShares, totalRoundShares]);

  // Calculate employee ESOP details with optimization
  const employeeESOP = useMemo(() => {
    if (!esopStats?.totalShares || !exitResults?.exitValue) return null;

    const ownershipPercent = (employeeShares / esopStats.totalShares) * 100;
    const currentValue = (ownershipPercent / 100) * (exitResults.currentValuation || 0);
    const exitValue = (ownershipPercent / 100) * exitResults.exitValue;
    
    // Calculate strike price (assuming 10% of current share price)
    const currentSharePrice = (exitResults.currentValuation || 0) / esopStats.totalShares;
    const strikePrice = currentSharePrice * 0.1;

    return {
      name: employeeName,
      shares: employeeShares,
      ownershipPercent,
      currentValue,
      exitValue,
      vestingSchedule: '4 years with 1-year cliff',
      strikePrice
    };
  }, [esopStats?.totalShares, exitResults?.exitValue, exitResults?.currentValuation, employeeShares, employeeName]);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup any subscriptions or timers if needed
    };
  }, []);

  // Show skeleton loading for better perceived performance
  if (!company) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ESOP Overview Header */}
      <Suspense fallback={<div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>}>
        <LazyCard className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <TeamOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={2} className="text-white mb-2">
                  Employee Stock Option Plan (ESOP)
                </Title>
                <Text className="text-green-100 text-lg">
                  {company.name} - ESOP Pool Management
                </Text>
              </div>
            </div>
          </div>
        </LazyCard>
      </Suspense>

      {/* ESOP Pool Statistics */}
      {esopStats && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Suspense fallback={<div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>}>
              <LazyCard className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TeamOutlined className="text-2xl text-green-600" />
                </div>
                <LazyStatistic
                  title="ESOP Pool Size"
                  value={esopStats.esopPoolPercent}
                  suffix="%"
                  valueStyle={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              </LazyCard>
            </Suspense>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Suspense fallback={<div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>}>
              <LazyCard className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PieChartOutlined className="text-2xl text-blue-600" />
                </div>
                <LazyStatistic
                  title="ESOP Shares"
                  value={esopStats.esopShares.toLocaleString()}
                  valueStyle={{ color: '#2563eb', fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              </LazyCard>
            </Suspense>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Suspense fallback={<div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>}>
              <LazyCard className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalculatorOutlined className="text-2xl text-purple-600" />
                </div>
                <LazyStatistic
                  title="Allocated Shares"
                  value={esopStats.allocatedESOPShares.toLocaleString()}
                  valueStyle={{ color: '#9333ea', fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              </LazyCard>
            </Suspense>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Suspense fallback={<div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>}>
              <LazyCard className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarOutlined className="text-2xl text-orange-600" />
                </div>
                <LazyStatistic
                  title="Remaining Pool"
                  value={esopStats.remainingESOPShares.toLocaleString()}
                  valueStyle={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              </LazyCard>
            </Suspense>
          </Col>
        </Row>
      )}

      {/* ESOP Pool Progress */}
      {esopStats && (
        <Suspense fallback={<div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>}>
          <LazyCard className="shadow-lg border-0 rounded-2xl">
            <Title level={4} className="mb-4 flex items-center">
              <PieChartOutlined className="mr-2 text-green-600" />
              ESOP Pool Allocation Progress
            </Title>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Text className="font-medium">ESOP Pool Utilization</Text>
                  <Text className="text-slate-600">
                    {esopStats.allocatedESOPShares.toLocaleString()} / {esopStats.esopShares.toLocaleString()} shares
                  </Text>
                </div>
                <LazyProgress
                  percent={Math.round((esopStats.allocatedESOPShares / esopStats.esopShares) * 100)}
                  strokeColor={{
                    '0%': '#10b981',
                    '100%': '#059669',
                  }}
                  size="default"
                  showInfo={false}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <Text className="text-2xl font-bold text-green-600 block">
                    {esopStats.allocatedESOPShares.toLocaleString()}
                  </Text>
                  <Text className="text-slate-600">Allocated</Text>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <Text className="text-2xl font-bold text-blue-600 block">
                    {esopStats.remainingESOPShares.toLocaleString()}
                  </Text>
                  <Text className="text-slate-600">Available</Text>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <Text className="text-2xl font-bold text-purple-600 block">
                    {esopStats.esopPoolPercent}%
                  </Text>
                  <Text className="text-slate-600">Pool Size</Text>
                </div>
              </div>
            </div>
          </LazyCard>
        </Suspense>
      )}

      {/* Employee ESOP Calculator */}
      <Suspense fallback={<div className="h-96 bg-slate-200 rounded-2xl animate-pulse"></div>}>
        <LazyCard className="shadow-lg border-0 rounded-2xl">
          <Title level={4} className="mb-4 flex items-center">
            <UserOutlined className="mr-2 text-blue-600" />
            Employee ESOP Calculator
          </Title>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <Text className="font-medium block mb-2">Employee Name</Text>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter employee name"
                />
              </div>
              
              <div>
                <Text className="font-medium block mb-2">Number of Shares</Text>
                <InputNumber
                  value={employeeShares}
                  onChange={(value) => setEmployeeShares(value || 0)}
                  min={0}
                  max={esopStats?.remainingESOPShares || 1000000}
                  className="w-full"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                  placeholder="Enter number of shares"
                />
                <Text className="text-xs text-slate-500 mt-1 block">
                  Max available: {esopStats?.remainingESOPShares.toLocaleString() || '0'} shares
                </Text>
              </div>
              
              <Alert
                message="ESOP Information"
                description="This calculator shows potential ownership and value based on current company valuation and exit scenarios."
                type="info"
                showIcon
                className="mt-4"
              />
            </div>
            
            {/* Results Section */}
            <div className="space-y-4">
              {employeeESOP && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <Title level={5} className="text-blue-800 mb-3">
                      {employeeESOP.name}'s ESOP Summary
                    </Title>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Text className="text-slate-600">Shares Granted:</Text>
                        <Text className="font-semibold">{employeeESOP.shares.toLocaleString()}</Text>
                      </div>
                      
                      <div className="flex justify-between">
                        <Text className="text-slate-600">Ownership %:</Text>
                        <Text className="font-semibold">{employeeESOP.ownershipPercent.toFixed(4)}%</Text>
                      </div>
                      
                      <div className="flex justify-between">
                        <Text className="text-slate-600">Current Value:</Text>
                        <Text className="font-semibold text-green-600">
                          ${employeeESOP.currentValue.toLocaleString()}
                        </Text>
                      </div>
                      
                      <div className="flex justify-between">
                        <Text className="text-slate-600">Exit Value:</Text>
                        <Text className="font-semibold text-blue-600">
                          ${employeeESOP.exitValue.toLocaleString()}
                        </Text>
                      </div>
                      
                      <div className="flex justify-between">
                        <Text className="text-slate-600">Strike Price:</Text>
                        <Text className="font-semibold text-purple-600">
                          ${employeeESOP.strikePrice.toFixed(4)}
                        </Text>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <Text className="text-sm text-slate-600">
                      <strong>Vesting Schedule:</strong> {employeeESOP.vestingSchedule}
                    </Text>
                    <Text className="text-sm text-slate-600 block mt-2">
                      <strong>Note:</strong> Values are estimates based on current company valuation and exit scenarios.
                    </Text>
                  </div>
                </>
              )}
            </div>
          </div>
        </LazyCard>
      </Suspense>

      {/* ESOP Pool Details */}
      {esopStats && (
        <Suspense fallback={<div className="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>}>
          <LazyCard className="shadow-lg border-0 rounded-2xl">
            <Title level={4} className="mb-4 flex items-center">
              <InfoCircleOutlined className="mr-2 text-indigo-600" />
              ESOP Pool Details
            </Title>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <Text className="font-medium">Total Company Shares</Text>
                  <Tag color="blue">{esopStats.totalShares.toLocaleString()}</Tag>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <Text className="font-medium">Founder Shares</Text>
                  <Tag color="green">{totalFounderShares.toLocaleString()}</Tag>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <Text className="font-medium">Investor Shares</Text>
                  <Tag color="orange">{totalRoundShares.toLocaleString()}</Tag>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <Text className="font-medium">ESOP Pool Size</Text>
                  <Tag color="purple">{esopStats.esopPoolPercent}%</Tag>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <Text className="font-medium">ESOP Shares</Text>
                  <Tag color="purple">{esopStats.esopShares.toLocaleString()}</Tag>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <Text className="font-medium">Available for ESOP</Text>
                  <Tag color="green">{esopStats.availableShares.toLocaleString()}</Tag>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div className="text-center">
              <Text className="text-slate-600">
                The ESOP pool is designed to attract and retain top talent by offering equity ownership in the company.
              </Text>
            </div>
          </LazyCard>
        </Suspense>
      )}
    </div>
  );
});

ESOPTab.displayName = 'ESOPTab';

export default ESOPTab;

 