'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Typography, Table, Spin, Alert } from 'antd';
import { DatabaseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Company, Founder, FundingRound, User } from '@/types';

interface DatabaseData {
  companies: Company[];
  founders: Founder[];
  fundingRounds: FundingRound[];
  users: User[];
}

interface DatabaseDebugTabProps {
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
}

// Memoized component to prevent unnecessary re-renders
const DatabaseDebugTab = React.memo(({ company, founders, fundingRounds }: DatabaseDebugTabProps) => {
  const [databaseData, setDatabaseData] = useState<DatabaseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Memoize event handlers to prevent unnecessary re-renders
  const fetchDatabaseData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/database');
      const result = await response.json();
      
      if (result.success) {
        setDatabaseData(result.data);
        setSuccessMessage('Database data loaded successfully');
        setError(null);
      } else {
        setError(result.message || 'Failed to load database data');
        setSuccessMessage(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatabaseData();
  }, [fetchDatabaseData]);

  // Memoize table columns to prevent recreation on every render
  const companyColumns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'User ID', dataIndex: 'user_id', key: 'user_id' },
    { title: 'Total Shares', dataIndex: 'total_shares', key: 'total_shares' },
    { title: 'Valuation', dataIndex: 'valuation', key: 'valuation' },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
  ], []);

  const founderColumns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Company ID', dataIndex: 'company_id', key: 'company_id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Initial Ownership', dataIndex: 'initial_ownership', key: 'initial_ownership' },
    { title: 'Current Ownership', dataIndex: 'current_ownership', key: 'current_ownership' },
    { title: 'Shares', dataIndex: 'shares', key: 'shares' },
  ], []);

  const fundingRoundColumns = useMemo(() => [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Company ID', dataIndex: 'company_id', key: 'company_id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Investment', dataIndex: 'investment_amount', key: 'investment_amount' },
    { title: 'Pre-Money Val', dataIndex: 'pre_money_valuation', key: 'pre_money_valuation' },
    { title: 'Shares Issued', dataIndex: 'shares_issued', key: 'shares_issued' },
  ], []);

  return (
    <div className="space-y-8 p-8">
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-100">
          <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <DatabaseOutlined className="text-3xl text-white" />
          </div>
            <div>
              <Typography.Title level={3} className="mb-1 text-slate-800">
                Database Debug Information
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                View and analyze your database data
              </Typography.Text>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={fetchDatabaseData}
            loading={isLoading}
            size="large"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Refresh Data
          </Button>
        </div>

        {/* Success/Error Messages */}
        {(successMessage || error) && (
          <div className="p-8">
            {successMessage && (
              <Alert
                message="Success"
                description={successMessage}
                type="success"
                showIcon
                closable
                onClose={() => setSuccessMessage(null)}
                className="mb-4"
              />
            )}
            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                className="mb-4"
              />
            )}
          </div>
        )}

        {/* Current Store State */}
        <div className="p-8 bg-slate-50">
          <Typography.Title level={4} className="mb-6 text-slate-700">
            Current Store State
          </Typography.Title>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <Typography.Text strong className="text-slate-700">Company Data</Typography.Text>
              </div>
              <div className="min-h-[120px]">
                {company ? (
                  <pre className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-32">
                    {JSON.stringify(company, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-20 text-slate-400">
                    <Typography.Text type="secondary">No company data</Typography.Text>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Typography.Text strong className="text-slate-700">
                  Founders ({founders.length})
                </Typography.Text>
              </div>
              <div className="min-h-[120px]">
                {founders.length > 0 ? (
                  <pre className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-32">
                    {JSON.stringify(founders, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-20 text-slate-400">
                    <Typography.Text type="secondary">No founders data</Typography.Text>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <Typography.Text strong className="text-slate-700">
                  Funding Rounds ({fundingRounds.length})
                </Typography.Text>
              </div>
              <div className="min-h-[120px]">
                {fundingRounds.length > 0 ? (
                  <pre className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-32">
                    {JSON.stringify(fundingRounds, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-20 text-slate-400">
                    <Typography.Text type="secondary">No funding rounds data</Typography.Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Database Data */}
        {error && (
          <div className="px-8 py-6">
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              className="shadow-sm"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spin size="large" />
            <p className="mt-6 text-lg text-slate-600 font-medium">Loading database data...</p>
          </div>
        ) : databaseData ? (
          <div className="p-8 space-y-8">
            {/* Companies Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <Typography.Title level={4} className="mb-0 text-slate-700">
                  Companies in Database ({databaseData.companies.length})
                </Typography.Title>
              </div>
              <div className="p-6">
                <Table
                  dataSource={databaseData.companies}
                  columns={companyColumns}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  className="custom-table"
                />
              </div>
            </div>

            {/* Founders Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <Typography.Title level={4} className="mb-0 text-slate-700">
                  Founders in Database ({databaseData.founders.length})
                </Typography.Title>
              </div>
              <div className="p-6">
                <Table
                  dataSource={databaseData.founders}
                  columns={founderColumns}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  className="custom-table"
                />
              </div>
            </div>

            {/* Funding Rounds Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <Typography.Title level={4} className="mb-0 text-slate-700">
                  Funding Rounds in Database ({databaseData.fundingRounds.length})
                </Typography.Title>
              </div>
              <div className="p-6">
                <Table
                  dataSource={databaseData.fundingRounds}
                  columns={fundingRoundColumns}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  className="custom-table"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <Typography.Title level={4} className="mb-0 text-slate-700">
                  Users in Database ({databaseData.users.length})
                </Typography.Title>
              </div>
              <div className="p-6">
                <Table
                  dataSource={databaseData.users}
                  columns={[
                    { title: 'ID', dataIndex: 'id', key: 'id' },
                    { title: 'Username', dataIndex: 'username', key: 'username' },
                    { title: 'Email', dataIndex: 'email', key: 'email' },
                    { title: 'Created', dataIndex: 'created_at', key: 'created_at' },
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  className="custom-table"
                />
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
});

DatabaseDebugTab.displayName = 'DatabaseDebugTab';

export default DatabaseDebugTab;
