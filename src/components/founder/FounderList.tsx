'use client';

import React from 'react';
import { Card, Table, Button, Tag, Popconfirm, message, Typography, Progress } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, MailOutlined } from '@ant-design/icons';
import { Founder } from '@/types';
import { useFounderStore } from '@/store/founder-store';

const { Text, Title } = Typography;

interface FounderListProps {
  companyId: string;
  companyShares: number;
  companyValuation?: number;
  onEditFounder: (founder: Founder) => void;
}

const FounderList: React.FC<FounderListProps> = ({
  companyId,
  companyShares,
  companyValuation,
  onEditFounder
}) => {
  const { founders, deleteFounder, calculateEquityDistribution } = useFounderStore();
  
  // Get founders for this company
  const companyFounders = founders.filter(f => f.company_id === companyId);
  
  // Calculate equity distribution
  const equityDistribution = calculateEquityDistribution(companyId);
  
  // Calculate total value if company valuation is available
  const totalValue = companyValuation || 0;
  
  const handleDeleteFounder = async (founder: Founder) => {
    try {
      await deleteFounder(founder.id);
      message.success(`Founder "${founder.name}" deleted successfully!`);
    } catch (error: any) {
      message.error(error.message || 'Failed to delete founder');
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Founder',
      key: 'founder',
      render: (founder: Founder) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
            <UserOutlined className="text-white text-sm" />
          </div>
          <div>
            <div className="font-medium text-slate-800">{founder.name}</div>
            {founder.email && (
              <div className="flex items-center text-xs text-slate-500">
                <MailOutlined className="mr-1" />
                {founder.email}
              </div>
            )}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Shares',
      key: 'shares',
      render: (founder: Founder) => (
        <div className="text-right">
          <div className="font-medium text-slate-800">
            {founder.shares.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">
            {((founder.shares / companyShares) * 100).toFixed(1)}% of total
          </div>
        </div>
      ),
      width: 120,
    },
    {
      title: 'Ownership',
      key: 'ownership',
      render: (founder: Founder) => (
        <div className="text-right">
          <div className="font-medium text-slate-800">
            {founder.initial_ownership.toFixed(1)}%
          </div>
          <Progress 
            percent={founder.initial_ownership} 
            size="small" 
            showInfo={false}
            strokeColor="#10b981"
            trailColor="#e2e8f0"
          />
        </div>
      ),
      width: 150,
    },
    {
      title: 'Current Value',
      key: 'value',
      render: (founder: Founder) => {
        if (totalValue > 0) {
          const founderValue = (founder.initial_ownership / 100) * totalValue;
          return (
            <div className="text-right">
              <div className="font-medium text-slate-800">
                ${founderValue.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">
                ${(founderValue / founder.shares).toFixed(2)}/share
              </div>
            </div>
          );
        }
        return (
          <div className="text-right text-slate-400">
            <Text type="secondary">Set company valuation</Text>
          </div>
        );
      },
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (founder: Founder) => (
        <div className="flex space-x-2">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEditFounder(founder)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Founder"
            description={`Are you sure you want to delete "${founder.name}"? This action cannot be undone.`}
            onConfirm={() => handleDeleteFounder(founder)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="hover:bg-red-50"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
      width: 120,
    },
  ];

  if (companyFounders.length === 0) {
    return (
      <Card className="shadow-lg border-0 rounded-xl">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-2xl text-slate-400" />
          </div>
          <Title level={4} className="text-slate-600 mb-2">
            No Founders Yet
          </Title>
          <Text type="secondary" className="text-slate-500">
            Add your first founder to start building your cap table
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Equity Summary Card */}
      <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="p-6">
          <Title level={4} className="text-slate-800 mb-4">
            Equity Distribution Summary
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {companyFounders.length}
              </div>
              <div className="text-sm text-slate-500">Total Founders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {equityDistribution.totalShares.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Shares Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {equityDistribution.totalOwnership.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500">Ownership Allocated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {(100 - equityDistribution.totalOwnership).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500">Remaining Available</div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Ownership Allocation</span>
              <span>{equityDistribution.totalOwnership.toFixed(1)}% / 100%</span>
            </div>
            <Progress 
              percent={equityDistribution.totalOwnership} 
              strokeColor="#3b82f6"
              trailColor="#e2e8f0"
              size={[40, 8]}
            />
          </div>
        </div>
      </Card>

      {/* Founders Table */}
      <Card className="shadow-lg border-0 rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={4} className="text-slate-800 mb-1">
                Company Founders
              </Title>
              <Text type="secondary" className="text-slate-500">
                Manage founder equity and ownership
              </Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={companyFounders}
            rowKey="id"
            pagination={false}
            className="founder-table"
            rowClassName="hover:bg-slate-50 transition-colors duration-200"
          />
        </div>
      </Card>
    </div>
  );
};

export default FounderList;
