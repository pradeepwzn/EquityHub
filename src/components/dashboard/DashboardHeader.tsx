'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Avatar, Dropdown, Space, Typography, Progress, Card, Row, Col, Tooltip, Statistic } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BankOutlined, TeamOutlined, FundProjectionScreenOutlined, InfoCircleOutlined, RocketOutlined, GiftOutlined, SwapOutlined, DownOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { Company, Founder, FundingRound } from '@/types';

interface DashboardHeaderProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  onSignOut: () => void;
}

// Memoized component to prevent unnecessary re-renders
const DashboardHeader = React.memo(({ company, founders, fundingRounds, onSignOut }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  // Ultra-fast calculations with for loops instead of reduce
  const headerStats = useMemo(() => {
    if (!company?.total_shares) {
      return {
        totalShares: 0,
        totalFounderShares: 0,
        totalRoundShares: 0,
        availableShares: 0
      };
    }
    
    const totalShares = company.total_shares;
    
    // Use for loops for maximum performance
    let totalFounderShares = 0;
    if (founders?.length) {
      for (let i = 0; i < founders.length; i++) {
        totalFounderShares += founders[i].shares || 0;
      }
    }
    
    let totalRoundShares = 0;
    if (fundingRounds?.length) {
      for (let i = 0; i < fundingRounds.length; i++) {
        totalRoundShares += fundingRounds[i].shares_issued || 0;
      }
    }
    
    const availableShares = Math.max(0, totalShares - totalFounderShares - totalRoundShares);
    
    return {
      totalShares,
      totalFounderShares,
      totalRoundShares,
      availableShares
    };
  }, [company?.total_shares, founders?.length, fundingRounds?.length]);

  // Memoize event handlers
  const handleSignOut = useCallback(() => {
    onSignOut();
  }, [onSignOut]);

  // Memoize user display name
  const userDisplayName = useMemo(() => {
    return user?.username || user?.email?.split('@')[0] || 'User';
  }, [user?.username, user?.email]);

  // Load all companies for switcher
  useEffect(() => {
    const loadCompanies = () => {
      // Mock companies data - replace with actual API call
      const mockCompanies: Company[] = [
        {
          id: '1',
          name: 'TechStart Inc.',
          user_id: user?.id || 'user-1',
          total_shares: 10000000,
          valuation: 5000000,
          esop_pool: 15,
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'InnovateCorp',
          user_id: user?.id || 'user-1',
          total_shares: 5000000,
          valuation: 2000000,
          esop_pool: 10,
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'StartupX',
          user_id: user?.id || 'user-1',
          total_shares: 8000000,
          valuation: 3000000,
          esop_pool: 12,
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setAllCompanies(mockCompanies);
    };
    
    loadCompanies();
  }, []);

  // Company switcher dropdown items
  const companySwitcherItems = useMemo(() => {
    const companyItems = allCompanies
      .filter(c => c.id !== company?.id) // Exclude current company
      .map(comp => ({
        key: comp.id,
        label: (
          <div 
            className="flex items-center justify-between p-2 hover:bg-blue-50 rounded cursor-pointer"
            onClick={() => {
              const userId = comp.user_id || user?.id || 'me';
              router.push(`/dashboard/${userId}/${comp.id}?tab=company`);
            }}
          >
            <div>
              <div className="font-semibold text-slate-800">{comp.name}</div>
              <div className="text-sm text-slate-500">
                ${comp.valuation?.toLocaleString() || '0'} valuation
              </div>
            </div>
            <BankOutlined className="text-blue-500" />
          </div>
        ),
        onClick: () => {
          const userId = comp.user_id || user?.id || 'me';
          router.push(`/dashboard/${userId}/${comp.id}?tab=company`);
        }
      }));

    const additionalItems = [
      {
        key: 'view-all',
        label: (
          <div 
            className="flex items-center p-2 hover:bg-green-50 rounded cursor-pointer text-green-600"
            onClick={() => router.push(`/dashboard/${user?.id || 'me'}`)}
          >
            <SwapOutlined className="mr-2" />
            View All Companies
          </div>
        ),
        onClick: () => router.push(`/dashboard/${user?.id || 'me'}`)
      }
    ];

    return [...companyItems, ...additionalItems];
  }, [allCompanies, company?.id, user?.id, router]);

  return (
    <div className="mb-8 sm:mb-10 lg:mb-12">
      {/* Main Header */}
      <Card className="shadow-xl border-0 rounded-3xl mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6 md:p-8 lg:p-10 text-white">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
            {/* Left Side - Website Name and About */}
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
              {/* Website Logo and Name */}
              <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 group cursor-pointer">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white bg-opacity-20 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:bg-opacity-30 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <RocketOutlined className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="group-hover:transform group-hover:translate-x-1 transition-all duration-300 min-w-0">
                  <Typography.Title 
                    level={3} 
                    className="text-white mb-1 sm:mb-2 font-bold group-hover:text-blue-50 transition-colors duration-300 text-base sm:text-lg md:text-xl lg:text-2xl leading-tight dashboard-header-title"
                  >
                    Startup Value Simulator
                  </Typography.Title>
                  <Typography.Text 
                    className="text-blue-100 group-hover:text-blue-50 transition-colors duration-300 block leading-tight dashboard-header-subtitle"
                  >
                    Professional Cap Table & Exit Scenario Calculator
                  </Typography.Text>
                </div>
              </div>

              {/* About Information */}
              <div className="hidden lg:block">
                <Tooltip 
                  title="Startup Value Simulator helps entrepreneurs and investors model cap table scenarios, track ownership dilution, and calculate potential returns at different exit valuations. Perfect for startup planning, fundraising negotiations, and exit strategy analysis."
                  placement="bottom"
                >
                  <Button 
                    type="text" 
                    icon={<InfoCircleOutlined className="text-lg" />} 
                    className="text-white hover:text-blue-200 border-white border-opacity-30 hover:border-opacity-50 hover:bg-white hover:bg-opacity-10 rounded-lg px-4 py-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="ml-2 font-medium">About</span>
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Right Side - User Info and Logout */}
            <div className="flex items-center justify-between lg:justify-end space-x-4 sm:space-x-6">
              {/* User Info */}
              <div className="text-right group cursor-pointer">
                <Typography.Text className="text-blue-100 block text-xs sm:text-sm group-hover:text-blue-50 transition-colors duration-300">
                  Welcome back
                </Typography.Text>
                <Typography.Text className="text-white font-medium text-sm sm:text-base group-hover:text-blue-50 transition-colors duration-300">
                  {userDisplayName}
                </Typography.Text>
              </div>

              {/* Logout Button */}
              <Button 
                type="default" 
                icon={<LogoutOutlined />}
                onClick={handleSignOut}
                size="middle"
                className="bg-white text-blue-600 border-white hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Company Status Bar */}
        <div className="p-4 sm:p-6 bg-white hover:bg-slate-50 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="group cursor-pointer flex-1">
                <Typography.Title level={4} className="mb-1 text-slate-800 group-hover:text-slate-900 transition-colors duration-300 text-base sm:text-lg">
                  {company ? `Managing: ${company.name}` : 'Ready to create your startup?'}
                </Typography.Title>
                <Typography.Text className="text-slate-500 group-hover:text-slate-600 transition-colors duration-300 text-sm sm:text-base">
                  {company 
                    ? `Total Shares: ${headerStats.totalShares.toLocaleString()} • Valuation: $${company.valuation?.toLocaleString() || '0'}`
                    : 'Start by creating your company profile to begin simulating startup scenarios'
                  }
                </Typography.Text>
              </div>
              
              {/* Company Switcher */}
              {company && allCompanies.length > 1 && (
                <Dropdown 
                  menu={{ items: companySwitcherItems }} 
                  placement="bottomRight"
                  trigger={['click']}
                >
                  <Button 
                    type="default" 
                    icon={<SwapOutlined />}
                    className="flex items-center hover:border-blue-400 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="hidden sm:inline ml-1">Switch Company</span>
                    <span className="sm:hidden ml-1">Switch</span>
                    <DownOutlined className="ml-1 text-xs" />
                  </Button>
                </Dropdown>
              )}
            </div>
            
            {/* Quick Stats */}
            {company && (
              <div className="flex flex-wrap justify-center lg:justify-end gap-4 sm:gap-6">
                <div className="text-center group cursor-pointer hover:transform hover:scale-105 transition-all duration-300">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">{founders.length}</div>
                  <div className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">Founders</div>
                </div>
                <div className="text-center group cursor-pointer hover:transform hover:scale-105 transition-all duration-300">
                  <div className="text-xl sm:text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300">{fundingRounds.length}</div>
                  <div className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">Funding Rounds</div>
                </div>
                <div className="text-center group cursor-pointer hover:transform hover:scale-105 transition-all duration-300">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-300">{headerStats.availableShares.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">Available Shares</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Summary Statistics Cards */}
      {/* Loading skeleton for stats */}
      {!company && (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Col key={i} xs={24} sm={12} md={8} lg={4}>
              <div className="animate-pulse">
                <div className="h-32 bg-slate-200 rounded-2xl"></div>
              </div>
            </Col>
          ))}
        </Row>
      )}
      
      {company && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BankOutlined className="text-lg sm:text-xl md:text-2xl text-blue-600" />
              </div>
              <Statistic
                title={<span className="text-xs sm:text-sm">Total Shares</span>}
                value={headerStats.totalShares}
                valueStyle={{ 
                  color: '#2563eb', 
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', 
                  fontWeight: 'bold' 
                }}
                formatter={(value) => value?.toLocaleString()}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TeamOutlined className="text-lg sm:text-xl md:text-2xl text-green-600" />
              </div>
              <Statistic
                title={<span className="text-xs sm:text-sm">Founders</span>}
                value={founders.length}
                valueStyle={{ 
                  color: '#16a34a', 
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', 
                  fontWeight: 'bold' 
                }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FundProjectionScreenOutlined className="text-lg sm:text-xl md:text-2xl text-orange-600" />
              </div>
              <Statistic
                title={<span className="text-xs sm:text-sm">Funding Rounds</span>}
                value={fundingRounds.length}
                valueStyle={{ 
                  color: '#f59e0b', 
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', 
                  fontWeight: 'bold' 
                }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BankOutlined className="text-lg sm:text-xl md:text-2xl text-purple-600" />
              </div>
              <Statistic
                title={<span className="text-xs sm:text-sm">Available Shares</span>}
                value={headerStats.availableShares}
                valueStyle={{ 
                  color: '#9333ea', 
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', 
                  fontWeight: 'bold' 
                }}
                formatter={(value) => value?.toLocaleString()}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card className="shadow-lg border-0 rounded-2xl text-center hover:shadow-xl transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <GiftOutlined className="text-lg sm:text-xl md:text-2xl text-emerald-600" />
              </div>
              <Statistic
                title={<span className="text-xs sm:text-sm">ESOP Pool</span>}
                value={company?.esop_pool || 10}
                suffix="%"
                valueStyle={{ 
                  color: '#059669', 
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', 
                  fontWeight: 'bold' 
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;

