'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Typography, Select, Table, Row, Col, Progress, Button, Space, Tag, Divider } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { Scenario, ScenarioComparison } from '@/types';

interface ScenarioComparisonTabProps {
  companyId: string;
  scenarios: Scenario[];
  onScenarioSelect: (scenario: Scenario) => void;
}

// Memoized component to prevent unnecessary re-renders
const ScenarioComparisonTab = React.memo(({ companyId, scenarios, onScenarioSelect }: ScenarioComparisonTabProps) => {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any>({});

  // Memoize expensive calculations
  const memoizedComparisonData = useMemo(() => {
    if (selectedScenarios.length < 2) return {};
    
    const data: any = {};
    
    selectedScenarios.forEach(scenarioId => {
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) return;

      const config = scenario.config;
      const totalShares = config.total_shares;
      const exitValue = config.exit_value;
      const sharePrice = exitValue / totalShares;

      // Optimize founder returns calculation
      const founderReturns = config.founders.map((founder: any) => {
        const shares = founder.shares;
        const ownershipPercent = (shares / totalShares) * 100;
        const exitValue = shares * sharePrice;
        return {
          name: founder.name,
          shares,
          ownershipPercent,
          exitValue
        };
      });

      // Optimize investor returns calculation
      const investorReturns = config.funding_rounds.map((round: any) => {
        const shares = round.shares_issued;
        const ownershipPercent = (shares / totalShares) * 100;
        const exitValue = shares * sharePrice;
        const initialInvestment = round.investment_amount;
        const returnMultiple = initialInvestment > 0 ? exitValue / initialInvestment : 0;
        
        return {
          name: round.name,
          shares,
          ownershipPercent,
          exitValue,
          initialInvestment,
          returnMultiple
        };
      });

      // Optimize ownership breakdown calculation
      const totalFounderShares = config.founders.reduce((sum: number, f: any) => sum + f.shares, 0);
      const totalInvestorShares = config.funding_rounds.reduce((sum: number, r: any) => sum + r.shares_issued, 0);
      const esopShares = (totalShares * config.esop_allocation) / 100;
      const availableShares = Math.max(0, totalShares - totalFounderShares - totalInvestorShares - esopShares);

      data[scenarioId] = {
        founderReturns,
        investorReturns,
        ownershipBreakdown: {
          founders: (totalFounderShares / totalShares) * 100,
          investors: (totalInvestorShares / totalShares) * 100,
          esop: (esopShares / totalShares) * 100,
          available: (availableShares / totalShares) * 100
        },
        totalFounderValue: founderReturns.reduce((sum: number, f: any) => sum + f.exitValue, 0),
        totalInvestorValue: investorReturns.reduce((sum: number, f: any) => sum + f.exitValue, 0),
        sharePrice,
        exitValue,
        totalShares
      };
    });

    return data;
  }, [selectedScenarios, scenarios]);

  // Use memoized data instead of recalculating
  useEffect(() => {
    setComparisonData(memoizedComparisonData);
  }, [memoizedComparisonData]);

  // Memoize expensive formatting functions
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, []);

  const formatPercentage = useCallback((value: number) => {
    return `${value.toFixed(1)}%`;
  }, []);

  // Memoize event handlers
  const handleScenarioSelect = useCallback((values: string[]) => {
    setSelectedScenarios(values);
  }, []);

  const handleExportComparison = useCallback(() => {
    // TODO: Implement PDF/Excel export
  }, []);

  const getScenarioName = useCallback((scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    return scenario?.name || 'Unknown';
  }, [scenarios]);

  const getScenarioColor = useCallback((index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[index % colors.length];
  }, []);

  // Table columns for comparison
  const comparisonColumns = useMemo(() => {
    const columns: any[] = [
      {
        title: 'Metric',
        dataIndex: 'metric',
        key: 'metric',
        fixed: 'left' as const,
        width: 200,
        render: (text: string) => (
          <Typography.Text strong className="text-slate-700">
            {text}
          </Typography.Text>
        )
      }
    ];

    selectedScenarios.forEach((scenarioId, index) => {
      columns.push({
        title: getScenarioName(scenarioId),
        dataIndex: scenarioId,
        key: scenarioId,
        width: 200,
        render: (value: any, record: any) => {
          const color = getScenarioColor(index);
          if (record.type === 'currency') {
            return (
              <Typography.Text strong style={{ color }}>
                {formatCurrency(value)}
              </Typography.Text>
            );
          } else if (record.type === 'percentage') {
            return (
              <Typography.Text strong style={{ color }}>
                {formatPercentage(value)}
              </Typography.Text>
            );
          } else if (record.type === 'number') {
            return (
              <Typography.Text strong style={{ color }}>
                {value.toLocaleString()}
              </Typography.Text>
            );
          }
          return value;
        }
      });
    });

    return columns;
  }, [selectedScenarios, getScenarioName, getScenarioColor, formatCurrency, formatPercentage]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (selectedScenarios.length < 2) return [];

    return [
      {
        key: 'exit_value',
        metric: 'Exit Value',
        type: 'currency',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.exitValue || 0
          ])
        )
      },
      {
        key: 'share_price',
        metric: 'Share Price',
        type: 'currency',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.sharePrice || 0
          ])
        )
      },
      {
        key: 'total_shares',
        metric: 'Total Shares',
        type: 'number',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.totalShares || 0
          ])
        )
      },
      {
        key: 'founder_ownership',
        metric: 'Founder Ownership',
        type: 'percentage',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.ownershipBreakdown?.founders || 0
          ])
        )
      },
      {
        key: 'investor_ownership',
        metric: 'Investor Ownership',
        type: 'percentage',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.ownershipBreakdown?.investors || 0
          ])
        )
      },
      {
        key: 'esop_ownership',
        metric: 'ESOP Pool',
        type: 'percentage',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.ownershipBreakdown?.esop || 0
          ])
        )
      },
      {
        key: 'total_founder_value',
        metric: 'Total Founder Value',
        type: 'currency',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.totalFounderValue || 0
          ])
        )
      },
      {
        key: 'total_investor_value',
        metric: 'Total Investor Value',
        type: 'currency',
        ...Object.fromEntries(
          selectedScenarios.map(scenarioId => [
            scenarioId,
            comparisonData[scenarioId]?.totalInvestorValue || 0
          ])
        )
      }
    ];
  }, [selectedScenarios, comparisonData]);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <BarChartOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Typography.Title level={3} className="mb-1 text-slate-800">
                Scenario Comparison
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                Compare multiple exit scenarios side-by-side
              </Typography.Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportComparison}
            disabled={selectedScenarios.length < 2}
            className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Export Comparison
          </Button>
        </div>

        <div className="p-8">
          {/* Scenario Selection */}
          <div className="mb-8">
            <Typography.Title level={4} className="mb-4 text-slate-700">
              Select Scenarios to Compare
            </Typography.Title>
            <Select
              mode="multiple"
              placeholder="Choose 2-3 scenarios to compare"
              value={selectedScenarios}
              onChange={handleScenarioSelect}
              style={{ width: '100%' }}
              maxTagCount={3}
              className="h-12 text-lg"
              options={scenarios.map(scenario => ({
                label: (
                  <div className="flex items-center justify-between">
                    <span>{scenario.name}</span>
                    <Tag color="blue" className="text-xs">
                      {formatCurrency(scenario.config.exit_value)}
                    </Tag>
                  </div>
                ),
                value: scenario.id
              }))}
            />
            <Typography.Text className="text-sm text-slate-500 mt-2 block">
              Select 2-3 scenarios to enable comparison. You can compare exit values, ownership breakdowns, and returns.
            </Typography.Text>
          </div>

          {/* Comparison Table */}
          {selectedScenarios.length >= 2 && (
            <div className="space-y-6">
              <Typography.Title level={4} className="text-slate-700">
                Scenario Comparison Table
              </Typography.Title>
              
              <div className="overflow-x-auto">
                <Table
                  columns={comparisonColumns}
                  dataSource={tableData}
                  pagination={false}
                  size="middle"
                  className="comparison-table"
                  rowClassName="hover:bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Visual Comparison */}
          {selectedScenarios.length >= 2 && (
            <div className="space-y-8 mt-8">
              <Typography.Title level={4} className="text-slate-700">
                Visual Comparison
              </Typography.Title>

              {/* Ownership Breakdown Chart */}
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card className="shadow-sm border border-slate-200">
                    <Typography.Title level={5} className="mb-4 text-slate-700 flex items-center">
                      <PieChartOutlined className="mr-2 text-blue-600" />
                      Ownership Breakdown
                    </Typography.Title>
                    <div className="space-y-4">
                      {selectedScenarios.map((scenarioId, index) => {
                        const data = comparisonData[scenarioId];
                        const color = getScenarioColor(index);
                        if (!data) return null;

                        return (
                          <div key={scenarioId} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Typography.Text strong style={{ color }}>
                                {getScenarioName(scenarioId)}
                              </Typography.Text>
                              <Typography.Text className="text-slate-600">
                                {formatPercentage(data.ownershipBreakdown.founders + data.ownershipBreakdown.investors)}
                              </Typography.Text>
                            </div>
                            <Progress
                              percent={data.ownershipBreakdown.founders + data.ownershipBreakdown.investors}
                              strokeColor={color}
                              showInfo={false}
                              strokeWidth={8}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card className="shadow-sm border border-slate-200">
                    <Typography.Title level={5} className="mb-4 text-slate-700 flex items-center">
                      <LineChartOutlined className="mr-2 text-green-600" />
                      Exit Value Comparison
                    </Typography.Title>
                    <div className="space-y-4">
                      {selectedScenarios.map((scenarioId, index) => {
                        const data = comparisonData[scenarioId];
                        const color = getScenarioColor(index);
                        if (!data) return null;

                        const maxValue = Math.max(...selectedScenarios.map(id => comparisonData[id]?.exitValue || 0));
                        const percentage = (data.exitValue / maxValue) * 100;

                        return (
                          <div key={scenarioId} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Typography.Text strong style={{ color }}>
                                {getScenarioName(scenarioId)}
                              </Typography.Text>
                              <Typography.Text className="text-slate-600">
                                {formatCurrency(data.exitValue)}
                              </Typography.Text>
                            </div>
                            <Progress
                              percent={percentage}
                              strokeColor={color}
                              showInfo={false}
                              strokeWidth={8}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Founder Returns Comparison */}
              <Card className="shadow-sm border border-slate-200">
                <Typography.Title level={5} className="mb-4 text-slate-700">
                  Founder Returns Comparison
                </Typography.Title>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {selectedScenarios.map((scenarioId, index) => {
                    const data = comparisonData[scenarioId];
                    const color = getScenarioColor(index);
                    if (!data) return null;

                    return (
                      <div key={scenarioId} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                          <Typography.Text strong style={{ color }}>
                            {getScenarioName(scenarioId)}
                          </Typography.Text>
                        </div>
                        <div className="space-y-2">
                          {data.founderReturns.map((founder: any, founderIndex: number) => (
                            <div key={founderIndex} className="flex justify-between items-center text-sm">
                              <span className="text-slate-600">{founder.name}</span>
                              <span className="font-semibold" style={{ color }}>
                                {formatCurrency(founder.exitValue)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* No Scenarios Selected */}
          {selectedScenarios.length < 2 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChartOutlined className="text-2xl text-slate-400" />
              </div>
              <Typography.Title level={5} className="text-slate-600 mb-2">
                Select Scenarios to Compare
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                Choose 2-3 scenarios from the dropdown above to start comparing exit strategies
              </Typography.Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
});

ScenarioComparisonTab.displayName = 'ScenarioComparisonTab';

export default ScenarioComparisonTab;
