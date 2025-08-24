'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, Typography, Timeline, Row, Col, Statistic, Progress, Tag, Divider } from 'antd';
import { 
  RocketOutlined, 
  DollarOutlined, 
  PieChartOutlined, 
  TrophyOutlined,
  RiseOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Company, Founder, FundingRound, ExitResults } from '@/types';

interface ScenarioTimelineProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
}

interface TimelineMilestone {
  key: string;
  title: string;
  description: string;
  type: 'initial' | 'round' | 'exit';
  data: {
    preMoneyValuation?: number;
    postMoneyValuation?: number;
    investmentAmount?: number;
    pricePerShare?: number;
    sharesIssued?: number;
    ownershipBreakdown?: {
      founders: number;
      investors: number;
      esop: number;
      available: number;
    };
    founderDetails?: Array<{
      name: string;
      ownership: number;
      shares: number;
      value: number;
    }>;
  };
}

// Memoized component to prevent unnecessary re-renders
const ScenarioTimeline = React.memo(({ 
  company, 
  founders, 
  fundingRounds, 
  exitResults 
}: ScenarioTimelineProps) => {
  
  // Memoize expensive timeline calculations
  const timelineMilestones = useMemo((): TimelineMilestone[] => {
    if (!company || founders.length === 0) {
      return [];
    }

    const milestones: TimelineMilestone[] = [];
    
    // Initial state (before any funding)
    const initialTotalShares = company.total_shares;
    const initialFounderShares = founders.reduce((sum, f) => sum + f.shares, 0);
    const initialFounderOwnership = (initialFounderShares / initialTotalShares) * 100;
    
    milestones.push({
      key: 'initial',
      title: 'Company Formation',
      description: 'Initial founder setup',
      type: 'initial',
      data: {
        preMoneyValuation: company.valuation || 0,
        postMoneyValuation: company.valuation || 0,
        pricePerShare: company.valuation ? company.valuation / initialTotalShares : 0,
        ownershipBreakdown: {
          founders: initialFounderOwnership,
          investors: 0,
          esop: 0,
          available: 100 - initialFounderOwnership
        },
        founderDetails: founders.map(f => ({
          name: f.name,
          ownership: (f.shares / initialTotalShares) * 100,
          shares: f.shares,
          value: company.valuation ? (f.shares / initialTotalShares) * company.valuation : 0
        }))
      }
    });

    // Add each funding round with optimized calculations
    let currentTotalShares = initialTotalShares;
    fundingRounds.forEach((round, index) => {
      const newSharesIssued = round.shares_issued;
      const newTotalShares = currentTotalShares + newSharesIssued;
      
      // Calculate new ownership percentages efficiently
      const newFounderOwnership = (initialFounderShares / newTotalShares) * 100;
      const newInvestorOwnership = (newSharesIssued / newTotalShares) * 100;
      const newAvailableOwnership = 100 - newFounderOwnership - newInvestorOwnership;
      
      milestones.push({
        key: `round-${index}`,
        title: round.name,
        description: `$${round.investment_amount.toLocaleString()} investment`,
        type: 'round',
        data: {
          preMoneyValuation: company.valuation || 0,
          postMoneyValuation: (company.valuation || 0) + round.investment_amount,
          investmentAmount: round.investment_amount,
          pricePerShare: round.investment_amount / newSharesIssued,
          sharesIssued: newSharesIssued,
          ownershipBreakdown: {
            founders: newFounderOwnership,
            investors: newInvestorOwnership,
            esop: 0,
            available: newAvailableOwnership
          },
          founderDetails: founders.map(f => ({
              name: f.name,
            ownership: (f.shares / newTotalShares) * 100,
            shares: f.shares,
            value: (company.valuation || 0) * (f.shares / newTotalShares)
          }))
        }
      });
      
      currentTotalShares = newTotalShares;
    });

    // Add exit scenario if available
    if (exitResults) {
      const exitTotalShares = currentTotalShares;
      const exitSharePrice = exitResults.exitValue / exitTotalShares;
      
      milestones.push({
        key: 'exit',
        title: 'Exit Scenario',
        description: `$${exitResults.exitValue.toLocaleString()} exit`,
        type: 'exit',
        data: {
          preMoneyValuation: exitResults.exitValue,
          postMoneyValuation: exitResults.exitValue,
          pricePerShare: exitSharePrice,
          sharesIssued: exitTotalShares,
          ownershipBreakdown: {
            founders: (initialFounderShares / exitTotalShares) * 100,
            investors: ((exitTotalShares - initialFounderShares) / exitTotalShares) * 100,
            esop: 0,
            available: 0
          },
          founderDetails: founders.map(f => ({
              name: f.name,
            ownership: (f.shares / exitTotalShares) * 100,
              shares: f.shares,
            value: f.shares * exitSharePrice
          }))
        }
      });
    }

    return milestones;
  }, [company, founders, fundingRounds, exitResults]);

  // Memoize formatting functions
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

  // Memoize timeline item rendering
  const renderTimelineItem = useCallback((milestone: TimelineMilestone) => {
    const { data } = milestone;

  return (
      <Timeline.Item
        key={milestone.key}
        dot={
          <div className={`w-4 h-4 rounded-full ${
            milestone.type === 'initial' ? 'bg-blue-500' :
            milestone.type === 'round' ? 'bg-green-500' :
            'bg-purple-500'
          }`} />
        }
      >
        <Card className="mb-4 shadow-sm border-0 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Typography.Title level={5} className="mb-1">
                {milestone.title}
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                {milestone.description}
              </Typography.Text>
            </div>
            <Tag color={
              milestone.type === 'initial' ? 'blue' :
              milestone.type === 'round' ? 'green' :
              'purple'
            }>
                        {milestone.type === 'initial' ? 'Formation' : 
               milestone.type === 'round' ? 'Funding' :
               'Exit'}
                      </Tag>
                  </div>

          {/* Key Metrics */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} sm={6}>
                            <Statistic
                              title="Pre-Money Valuation"
                value={data.preMoneyValuation}
                formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
                valueStyle={{ fontSize: '14px', color: '#3b82f6' }}
              />
            </Col>
            <Col xs={12} sm={6}>
                            <Statistic
                              title="Post-Money Valuation"
                value={data.postMoneyValuation}
                formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
                valueStyle={{ fontSize: '14px', color: '#10b981' }}
              />
            </Col>
            {data.investmentAmount && (
              <Col xs={12} sm={6}>
                            <Statistic
                              title="Investment Amount"
                  value={data.investmentAmount}
                  formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
                  valueStyle={{ fontSize: '14px', color: '#f59e0b' }}
                />
              </Col>
            )}
            <Col xs={12} sm={6}>
                            <Statistic
                              title="Price per Share"
                value={data.pricePerShare}
                formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
                valueStyle={{ fontSize: '14px', color: '#8b5cf6' }}
              />
                      </Col>
                    </Row>

                  {/* Ownership Breakdown */}
          {data.ownershipBreakdown && (
            <div className="mb-4">
              <Typography.Title level={5} className="mb-3">
                        Ownership Breakdown
                      </Typography.Title>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div className="text-center">
                            <Progress 
                      type="circle"
                      percent={data.ownershipBreakdown.founders}
                      size={60}
                              strokeColor="#3b82f6"
                      format={(percent) => `${percent}%`}
                            />
                    <div className="mt-2 text-sm text-slate-600">Founders</div>
                          </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center">
                            <Progress 
                      type="circle"
                      percent={data.ownershipBreakdown.investors}
                      size={60}
                              strokeColor="#10b981"
                      format={(percent) => `${percent}%`}
                            />
                    <div className="mt-2 text-sm text-slate-600">Investors</div>
                          </div>
                </Col>
              </Row>
                      </div>
                  )}

                  {/* Founder Details */}
          {data.founderDetails && data.founderDetails.length > 0 && (
            <div>
              <Typography.Title level={5} className="mb-3">
                        Founder Details
                      </Typography.Title>
              <Row gutter={[16, 16]}>
                {data.founderDetails.map((founder, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <Card size="small" className="bg-slate-50">
                      <div className="flex items-center justify-between">
                              <div>
                          <Typography.Text strong>{founder.name}</Typography.Text>
                          <div className="text-sm text-slate-500">
                            {formatPercentage(founder.ownership)} ownership
                              </div>
                            </div>
                            <div className="text-right">
                          <div className="text-sm font-medium">
                            {founder.shares.toLocaleString()} shares
                              </div>
                          <div className="text-sm text-slate-500">
                                {formatCurrency(founder.value)}
                              </div>
                            </div>
                          </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card>
      </Timeline.Item>
    );
  }, [formatCurrency, formatPercentage]);

  if (!company || founders.length === 0) {
    return (
      <Card className="shadow-lg border-0 rounded-2xl">
        <div className="text-center py-12">
          <ClockCircleOutlined className="text-6xl text-slate-300 mb-4" />
          <Typography.Title level={4} className="text-slate-500 mb-2">
            No Timeline Data Available
          </Typography.Title>
          <Typography.Text className="text-slate-400">
            Create a company and add founders to see the timeline
          </Typography.Text>
                      </div>
                    </Card>
    );
  }

  return (
    <div>
      <Card className="shadow-lg border-0 rounded-2xl mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <ClockCircleOutlined className="text-2xl text-blue-600" />
          <Typography.Title level={3} className="mb-0">
            Company Timeline
          </Typography.Title>
                </div>
        
        <Timeline className="ml-4">
          {timelineMilestones.map(renderTimelineItem)}
        </Timeline>
      </Card>
    </div>
  );
});

ScenarioTimeline.displayName = 'ScenarioTimeline';

export default ScenarioTimeline;
