'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, Button, Form, InputNumber, Typography, message, Input } from 'antd';
import { BankOutlined, DollarOutlined, RiseOutlined, SaveOutlined } from '@ant-design/icons';
import { Company, Founder, FundingRound } from '@/types';

interface CompanyTabProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  onCompanySubmit: (values: { name: string; total_shares: number; valuation: number; esop_pool: number }) => void;
  onTabChange: (key: string) => void;
}

// Memoized component to prevent unnecessary re-renders
const CompanyTab = React.memo(({ company, founders, fundingRounds, onCompanySubmit, onTabChange }: CompanyTabProps) => {
  const [form] = Form.useForm();

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback((values: { name: string; total_shares: number; valuation: number; esop_pool: number }) => {
    onCompanySubmit(values);
    message.success('Company updated successfully!');
  }, [onCompanySubmit]);

  // Memoize expensive calculations
  const shareStats = useMemo(() => {
    const totalFounderShares = founders.reduce((sum, f) => sum + (f.shares || 0), 0);
    const totalRoundShares = fundingRounds.reduce((sum, r) => sum + (r.shares_issued || 0), 0);
    const totalIssuedShares = totalFounderShares + totalRoundShares;
    const esopShares = company ? Math.floor((company.total_shares * (company.esop_pool || 0)) / 100) : 0;
    const availableShares = company ? Math.max(0, company.total_shares - totalIssuedShares - esopShares) : 0;
    const issuedOwnership = company ? ((totalIssuedShares + esopShares) / company.total_shares) * 100 : 0;
    
    return {
      totalFounderShares,
      totalRoundShares,
      totalIssuedShares,
      esopShares,
      availableShares,
      issuedOwnership
    };
  }, [company, founders, fundingRounds]);

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
      {/* Company Form */}
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="flex items-center p-6 sm:p-8 lg:p-10 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6">
            <BankOutlined className="text-3xl text-white" />
          </div>
          <div>
            <Typography.Title level={3} className="mb-2 text-slate-800">
              Company Information
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-base">
              Set up your company profile and basic details
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 lg:p-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: company?.name || '',
              total_shares: company?.total_shares || 10000000,
              valuation: company?.valuation || 1000000,
              esop_pool: company?.esop_pool || 10,
            }}
            className="max-w-4xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              <Form.Item
                name="name"
                label={<span className="text-slate-700 font-medium text-base">Company Name</span>}
                rules={[{ required: true, message: 'Please enter company name' }]}
                className="mb-8"
              >
                <Input
                  placeholder="Enter company name"
                  className="h-14 text-base border-slate-200 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </Form.Item>
              
              <Form.Item
                name="total_shares"
                label={<span className="text-slate-700 font-medium">Total Shares</span>}
                rules={[
                  { required: true, message: 'Please enter total shares' },
                  { type: 'number', min: 1000, message: 'Total shares must be at least 1,000' }
                ]}
                className="mb-6"
              >
                <InputNumber
                  className="w-full h-12 text-base border-slate-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Total shares"
                  formatter={(value: number | undefined) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || ''}
                  parser={(value: string | undefined) => parseInt(value?.replace(/\D/g, '') || '0')}
                  min={1}
                />
              </Form.Item>
              
              <Form.Item
                name="valuation"
                label={<span className="text-slate-700 font-medium">Company Valuation ($)</span>}
                rules={[
                  { required: true, message: 'Please enter company valuation' },
                  { type: 'number', min: 1000, message: 'Valuation must be at least $1,000' }
                ]}
                className="mb-6"
              >
                <InputNumber
                  className="w-full h-12 text-base border-slate-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Company valuation"
                  formatter={(value: number | undefined) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || ''}
                  parser={(value: string | undefined) => parseInt(value?.replace(/\D/g, '') || '0')}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="esop_pool"
                label={<span className="text-slate-700 font-medium">ESOP Pool (%)</span>}
                rules={[
                  { required: true, message: 'Please enter ESOP pool percentage' },
                  { type: 'number', min: 0, max: 100, message: 'ESOP pool must be between 0% and 100%' }
                ]}
                className="mb-6"
              >
                <InputNumber
                  className="w-full h-12 text-base border-slate-300 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="ESOP pool percentage"
                  min={0}
                  max={100}
                  formatter={(value: number | undefined) => `${value || 0}%`}
                  parser={(value: string | undefined) => parseInt(value?.replace('%', '') || '0')}
                />
              </Form.Item>
            </div>
            
            <div className="flex justify-end pt-6 border-t border-slate-100">
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                size="large"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
              >
                Save Company
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      {/* Company Overview */}
      {company && (
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="flex items-center p-8 border-b border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
              <RiseOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Typography.Title level={3} className="mb-1 text-slate-800">
                Company Overview
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                Key metrics and company details
              </Typography.Text>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <Typography.Title level={4} className="text-blue-700 mb-0">
                    Company Name
                  </Typography.Title>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
                    </svg>
                  </div>
                </div>
                <Typography.Text className="text-xl font-bold text-blue-800">
                  {company.name}
                </Typography.Text>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <Typography.Title level={4} className="text-green-700 mb-0">
                    Total Shares
                  </Typography.Title>
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <Typography.Text className="text-xl font-bold text-green-800">
                  {company.total_shares.toLocaleString()}
                </Typography.Text>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <Typography.Title level={4} className="text-purple-700 mb-0">
                    Company Valuation
                  </Typography.Title>
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
                    </svg>
                  </div>
                </div>
                <Typography.Text className="text-xl font-bold text-purple-800">
                  ${company.valuation?.toLocaleString() || '0'}
                </Typography.Text>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <Typography.Title level={4} className="text-orange-700 mb-0">
                    Price per Share
                  </Typography.Title>
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
                    </svg>
                  </div>
                </div>
                <Typography.Text className="text-xl font-bold text-orange-800">
                  ${company.valuation ? (company.valuation / company.total_shares).toFixed(4) : '0'}
                </Typography.Text>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Cap Table Summary */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="flex items-center p-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
            <DollarOutlined className="text-2xl text-white" />
          </div>
          <div>
            <Typography.Title level={3} className="mb-1 text-slate-800">
              Cap Table Summary
            </Typography.Title>
            <Typography.Text className="text-slate-500">
              Ownership distribution and share allocation
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <Typography.Title level={4} className="text-blue-700 mb-0">
                  Founder Shares
                </Typography.Title>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <Typography.Text className="text-2xl font-bold text-blue-800 block mb-2">
                {shareStats.totalFounderShares.toLocaleString()}
              </Typography.Text>
              <Typography.Text className="text-sm text-blue-600">
                {company ? ((shareStats.totalFounderShares / company.total_shares) * 100).toFixed(1) : '0'}% of company
              </Typography.Text>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <Typography.Title level={4} className="text-green-700 mb-0">
                  Investor Shares
                </Typography.Title>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <Typography.Text className="text-2xl font-bold text-green-800 block mb-2">
                {shareStats.totalRoundShares.toLocaleString()}
              </Typography.Text>
              <Typography.Text className="text-sm text-green-600">
                {company ? ((shareStats.totalRoundShares / company.total_shares) * 100).toFixed(1) : '0'}% of company
              </Typography.Text>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <Typography.Title level={4} className="text-orange-700 mb-0">
                  Available Shares
                </Typography.Title>
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
                  </svg>
                </div>
              </div>
              <Typography.Text className="text-2xl font-bold text-orange-800 block mb-2">
                {shareStats.availableShares.toLocaleString()}
              </Typography.Text>
              <Typography.Text className="text-sm text-orange-600">
                {company ? ((shareStats.availableShares / company.total_shares) * 100).toFixed(1) : '0'}% of company
              </Typography.Text>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <Typography.Title level={4} className="text-green-700 mb-0">
                  ESOP Pool
                </Typography.Title>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <Typography.Text className="text-2xl font-bold text-green-800 block mb-2">
                {shareStats.esopShares.toLocaleString()}
              </Typography.Text>
              <Typography.Text className="text-sm text-green-600">
                {company?.esop_pool || 0}% of company
              </Typography.Text>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <Typography.Title level={4} className="text-purple-700 mb-0">
                  Total Issued
                </Typography.Title>
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
                  </svg>
                </div>
              </div>
              <Typography.Text className="text-2xl font-bold text-purple-800 block mb-2">
                {shareStats.totalIssuedShares.toLocaleString()}
              </Typography.Text>
              <Typography.Text className="text-sm text-purple-600">
                {shareStats.issuedOwnership.toFixed(1)}% of company
              </Typography.Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="text-center p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <Typography.Title level={4} className="mb-6 text-slate-800">
            Next Steps
          </Typography.Title>
          <div className="space-y-6 max-w-2xl mx-auto">
            {!company && (
              <Typography.Text className="text-lg text-slate-600 block">
                Start by creating your company profile above.
              </Typography.Text>
            )}
            {company && founders.length === 0 && (
              <div className="space-y-4">
                <Typography.Text className="text-lg text-slate-600 block">
                  Great! Now add your founding team members.
                </Typography.Text>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => onTabChange('founders')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
                >
                  Add Founders
                </Button>
              </div>
            )}
            {company && founders.length > 0 && fundingRounds.length === 0 && (
              <div className="space-y-4">
                <Typography.Text className="text-lg text-slate-600 block">
                  Founders added! Now add funding rounds to see dilution effects.
                </Typography.Text>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => onTabChange('rounds')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
                >
                  Add Funding Rounds
                </Button>
              </div>
            )}
            {company && founders.length > 0 && fundingRounds.length > 0 && (
              <div className="space-y-4">
                <Typography.Text className="text-lg text-slate-600 block">
                  Excellent! View your exit scenario calculations.
                </Typography.Text>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => onTabChange('results')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
                >
                  View Exit Scenarios
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});

CompanyTab.displayName = 'CompanyTab';

export default CompanyTab;

