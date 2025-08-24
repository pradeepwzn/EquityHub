'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, Typography, Row, Col, Statistic, Progress, Tag, Button, Space, Divider } from 'antd';
import { UserOutlined, DollarOutlined, PieChartOutlined, RiseOutlined, CrownOutlined, TeamOutlined } from '@ant-design/icons';
import { Company, Founder, FundingRound, ExitResults } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface FounderAccountTabProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;
}

const FounderAccountTab: React.FC<FounderAccountTabProps> = React.memo(({ 
  company, 
  founders, 
  fundingRounds, 
  exitResults 
}) => {
  const { user } = useAuth();

  // Find the current user's founder profile
  const currentFounder = useMemo(() => {
    if (!user?.email || !founders.length) return null;
    
    // Try to match by email first, then by name
    return founders.find(founder => 
      founder.email === user.email || 
      founder.name.toLowerCase().includes(user.email?.split('@')[0].toLowerCase() || '')
    ) || null;
  }, [user?.email, founders]);

  // Calculate founder's current ownership and value
  const founderStats = useMemo(() => {
    if (!currentFounder || !company) return null;

    const totalShares = company.total_shares;
    const founderShares = currentFounder.shares || 0;
    const currentOwnership = (founderShares / totalShares) * 100;
    
    // Calculate current value based on company valuation
    const currentValue = (currentOwnership / 100) * (company.valuation || 0);
    
    // Calculate exit value if available
    const exitValue = exitResults?.exitValue ? 
      (currentOwnership / 100) * exitResults.exitValue : 0;

    // Calculate dilution from funding rounds
    let dilutedOwnership = currentOwnership;
    let dilutedShares = founderShares;
    
    fundingRounds.forEach(round => {
      if (round.shares_issued && round.shares_issued > 0) {
        const newTotalShares = totalShares + round.shares_issued;
        dilutedShares = (founderShares / newTotalShares) * totalShares;
        dilutedOwnership = (dilutedShares / newTotalShares) * 100;
      }
    });

    return {
      founderShares,
      currentOwnership,
      dilutedOwnership,
      currentValue,
      exitValue,
      totalShares,
      isFounder: true
    };
  }, [currentFounder, company, fundingRounds, exitResults]);

  // If user is not a founder, show message
  if (!currentFounder) {
    return (
      <div className="space-y-8 p-6 sm:p-8 lg:p-10">
        <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="flex items-center p-6 sm:p-8 lg:p-10 border-b border-slate-100">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mr-6">
              <UserOutlined className="text-3xl text-white" />
            </div>
            <div>
              <Typography.Title level={3} className="mb-2 text-slate-800">
                Founder Account
              </Typography.Title>
              <Typography.Text className="text-slate-500 text-base">
                View your personal founder information and ownership
              </Typography.Text>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 lg:p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserOutlined className="text-3xl text-amber-600" />
            </div>
            <Typography.Title level={4} className="mb-4 text-slate-700">
              Not Found as Founder
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-base block mb-6">
              You are not currently listed as a founder in this company. 
              Please contact the company administrator to be added to the founders list.
            </Typography.Text>
            <div className="bg-slate-50 rounded-xl p-6 max-w-md mx-auto">
              <Typography.Text className="text-slate-600 text-sm">
                <strong>Your Email:</strong> {user?.email}
              </Typography.Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
      {/* Founder Profile Header */}
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="flex items-center p-6 sm:p-8 lg:p-10 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-6">
            <CrownOutlined className="text-3xl text-white" />
          </div>
          <div>
            <Typography.Title level={3} className="mb-2 text-slate-800">
              Founder Account
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-base">
              Your personal founder information and ownership details
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Founder Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserOutlined className="text-2xl text-white" />
                  </div>
                  <Typography.Title level={4} className="mb-2 text-slate-800">
                    {currentFounder.name}
                  </Typography.Title>
                  <Tag color="purple" className="text-sm">
                    <CrownOutlined className="mr-1" />
                    Founder
                  </Tag>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChartOutlined className="text-2xl text-white" />
                  </div>
                  <Typography.Title level={4} className="mb-2 text-slate-800">
                    {founderStats?.currentOwnership.toFixed(2)}%
                  </Typography.Title>
                  <Typography.Text className="text-slate-600 text-sm">
                    Current Ownership
                  </Typography.Text>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={8}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiseOutlined className="text-2xl text-white" />
                  </div>
                  <Typography.Title level={4} className="mb-2 text-slate-800">
                    ${(founderStats?.currentValue || 0).toLocaleString()}
                  </Typography.Title>
                  <Typography.Text className="text-slate-600 text-sm">
                    Current Value
                  </Typography.Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Ownership Details */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} lg={12}>
              <Card className="shadow-lg border-0 rounded-2xl h-full">
                <Typography.Title level={4} className="mb-6 text-slate-700">
                  <PieChartOutlined className="mr-2 text-blue-600" />
                  Ownership Breakdown
                </Typography.Title>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Typography.Text className="text-slate-600">Your Ownership</Typography.Text>
                      <Typography.Text className="font-medium">
                        {founderStats?.currentOwnership.toFixed(2)}%
                      </Typography.Text>
                    </div>
                    <Progress 
                      percent={founderStats?.currentOwnership || 0} 
                      strokeColor="#8b5cf6"
                      showInfo={false}
                      className="mb-4"
                    />
                    <div className="text-sm text-slate-500">
                      {founderStats?.founderShares.toLocaleString()} shares out of {founderStats?.totalShares.toLocaleString()} total
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Typography.Text className="text-slate-600">Other Founders</Typography.Text>
                      <Typography.Text className="font-medium">
                        {founders.filter(f => f.id !== currentFounder.id).reduce((sum, f) => sum + (f.current_ownership || 0), 0).toFixed(2)}%
                      </Typography.Text>
                    </div>
                    <Progress 
                      percent={founders.filter(f => f.id !== currentFounder.id).reduce((sum, f) => sum + (f.current_ownership || 0), 0)} 
                      strokeColor="#06b6d4"
                      showInfo={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Typography.Text className="text-slate-600">ESOP Pool</Typography.Text>
                      <Typography.Text className="font-medium">
                        {company?.esop_pool || 0}%
                      </Typography.Text>
                    </div>
                    <Progress 
                      percent={company?.esop_pool || 0} 
                      strokeColor="#10b981"
                      showInfo={false}
                    />
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card className="shadow-lg border-0 rounded-2xl h-full">
                <Typography.Title level={4} className="mb-6 text-slate-700">
                  <DollarOutlined className="mr-2 text-green-600" />
                  Value Projections
                </Typography.Title>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <Typography.Text className="text-blue-800 font-medium block mb-2">
                      Current Company Value
                    </Typography.Text>
                    <Typography.Title level={3} className="text-blue-800 mb-0">
                      ${(company?.valuation || 0).toLocaleString()}
                    </Typography.Title>
                    <Typography.Text className="text-blue-600 text-sm">
                      Your stake: ${(founderStats?.currentValue || 0).toLocaleString()}
                    </Typography.Text>
                  </div>
                  
                  {exitResults?.exitValue && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <Typography.Text className="text-green-800 font-medium block mb-2">
                        Exit Scenario Value
                      </Typography.Text>
                      <Typography.Title level={3} className="text-green-800 mb-0">
                        ${exitResults.exitValue.toLocaleString()}
                      </Typography.Title>
                      <Typography.Text className="text-green-600 text-sm">
                        Your potential return: ${(founderStats?.exitValue || 0).toLocaleString()}
                      </Typography.Text>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 rounded-xl p-4">
                    <Typography.Text className="text-purple-800 font-medium block mb-2">
                      Dilution Impact
                    </Typography.Text>
                    <Typography.Text className="text-purple-700 text-sm">
                      After {fundingRounds.length} funding round{fundingRounds.length !== 1 ? 's' : ''}, 
                      your ownership may be diluted to approximately {founderStats?.dilutedOwnership.toFixed(2)}%
                    </Typography.Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Funding Rounds Impact */}
          {fundingRounds.length > 0 && (
            <Card className="shadow-lg border-0 rounded-2xl">
              <Typography.Title level={4} className="mb-6 text-slate-700">
                <TeamOutlined className="mr-2 text-indigo-600" />
                Funding Rounds Impact
              </Typography.Title>
              
              <div className="space-y-4">
                {fundingRounds.map((round, index) => (
                  <div key={round.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <Typography.Text className="font-medium text-slate-800">
                          {round.name}
                        </Typography.Text>
                        <div className="text-sm text-slate-500">
                          ${(round.investment_amount || 0).toLocaleString()} • {round.round_type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Typography.Text className="text-slate-600 text-sm">
                        Pre-money: ${(round.pre_money_valuation || 0).toLocaleString()}
                      </Typography.Text>
                      <div className="text-sm text-slate-500">
                        Post-money: ${(round.post_money_valuation || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
});

FounderAccountTab.displayName = 'FounderAccountTab';

export default FounderAccountTab;
