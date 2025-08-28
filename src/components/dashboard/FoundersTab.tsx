'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Form, InputNumber, Typography, Space, Table, Modal, message, Alert } from 'antd';
import { UserOutlined, PlusOutlined, DeleteOutlined, EditOutlined, TeamOutlined, CrownOutlined } from '@ant-design/icons';
import { Company, Founder } from '@/types';

interface FoundersTabProps {
  company: Company | null;
  founders: Founder[];
  onAddFounder: (values: { name: string; initial_ownership: number }) => void;
  onRemoveFounder: (founderId: string) => void;
  onTabChange: (key: string) => void;
}

// Memoized component to prevent unnecessary re-renders
const FoundersTab = React.memo(({ company, founders, onAddFounder, onRemoveFounder }: FoundersTabProps) => {
  const [form] = Form.useForm();

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback((values: { name: string; initial_ownership: number }) => {
    onAddFounder(values);
    form.resetFields();
    message.success('Founder added successfully');
  }, [onAddFounder, form]);

  const handleRemoveFounder = useCallback((founderId: string) => {
    Modal.confirm({
      title: 'Remove Founder',
      content: 'Are you sure you want to remove this founder?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        onRemoveFounder(founderId);
        message.success('Founder removed successfully');
      },
    });
  }, [onRemoveFounder]);

  // Memoize expensive calculations
  const ownershipStats = useMemo(() => {
    const totalFounderOwnership = founders.reduce((sum, founder) => sum + (founder.initial_ownership || 0), 0);
    const esopPool = company?.esop_pool || 0;
    const totalAllocated = totalFounderOwnership + esopPool;
    const remainingOwnership = Math.max(0, 100 - totalAllocated);
    const isOverAllocated = totalAllocated > 100;
    
    return {
      totalFounderOwnership,
      esopPool,
      totalAllocated,
      remainingOwnership,
      isOverAllocated
    };
  }, [founders, company?.esop_pool]);

  // Memoize table columns to prevent recreation on every render
  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center">
          <UserOutlined className="text-blue-600 mr-2" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value: string) => value ? (
        <span className="text-slate-600">{value}</span>
      ) : (
        <span className="text-slate-400 italic">Not provided</span>
      ),
    },
    {
      title: 'Initial Ownership',
      dataIndex: 'initial_ownership',
      key: 'initial_ownership',
      render: (value: number) => `${(value || 0).toFixed(1)}%`,
    },
    {
      title: 'Current Ownership',
      dataIndex: 'current_ownership',
      key: 'current_ownership',
      render: (value: number) => `${(value || 0).toFixed(1)}%`,
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      render: (value: number) => (value || 0).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Founder) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              // TODO: Implement edit functionality
              message.info('Edit functionality coming soon');
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveFounder(record.id)}
          />
        </Space>
      ),
    },
  ], [handleRemoveFounder]);

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
      {/* Add Founder Form */}
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="flex items-center p-6 sm:p-8 lg:p-10 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-6">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <Typography.Title level={3} className="mb-2 text-slate-800">
              Add Founder
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-base">
              Add founding team members and their ownership
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 lg:p-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              <Form.Item
                name="name"
                label={<span className="text-slate-700 font-medium text-base">Founder Name</span>}
                rules={[{ required: true, message: 'Please enter founder name' }]}
                className="mb-8"
              >
                <input
                  type="text"
                  placeholder="Enter founder name"
                  className="w-full h-14 px-4 text-base border border-slate-200 rounded-xl hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                />
              </Form.Item>
              
              <Form.Item
                name="email"
                label={<span className="text-slate-700 font-medium text-base">Email (Optional)</span>}
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
                className="mb-8"
              >
                <input
                  type="email"
                  placeholder="Enter founder email"
                  className="w-full h-14 px-4 text-base border border-slate-200 rounded-xl hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 outline-none"
                />
              </Form.Item>
              
              <Form.Item
                name="initial_ownership"
                label={<span className="text-slate-700 font-medium">Initial Ownership (%)</span>}
                rules={[
                  { required: true, message: 'Please enter initial ownership' },
                  { type: 'number', min: 0, max: 100, message: 'Ownership must be between 0% and 100%' }
                ]}
                className="mb-6"
              >
                <InputNumber
                  className="w-full h-12 text-base border border-slate-300 rounded-lg hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  placeholder="Ownership percentage"
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
                icon={<PlusOutlined />}
                size="large"
                className="bg-gradient-to-r from-green-600 to-emerald-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
              >
                Add Founder
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      {/* Equity Allocation Summary */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="p-6">
          <Typography.Title level={4} className="mb-4 text-slate-800">
            Equity Allocation Summary
          </Typography.Title>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Typography.Text className="text-sm text-blue-600 block mb-1">Founders</Typography.Text>
              <Typography.Text className="text-xl font-bold text-blue-800">
                {ownershipStats.totalFounderOwnership.toFixed(1)}%
              </Typography.Text>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <Typography.Text className="text-sm text-green-600 block mb-1">ESOP Pool</Typography.Text>
              <Typography.Text className="text-xl font-bold text-green-800">
                {ownershipStats.esopPool.toFixed(1)}%
              </Typography.Text>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <Typography.Text className="text-sm text-purple-600 block mb-1">Total Allocated</Typography.Text>
              <Typography.Text className="text-xl font-bold text-purple-800">
                {ownershipStats.totalAllocated.toFixed(1)}%
              </Typography.Text>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              ownershipStats.isOverAllocated 
                ? 'bg-red-50 border-red-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <Typography.Text className={`text-sm block mb-1 ${
                ownershipStats.isOverAllocated ? 'text-red-600' : 'text-orange-600'
              }`}>
                {ownershipStats.isOverAllocated ? 'Over Allocated' : 'Remaining'}
              </Typography.Text>
              <Typography.Text className={`text-xl font-bold ${
                ownershipStats.isOverAllocated ? 'text-red-800' : 'text-orange-800'
              }`}>
                {ownershipStats.isOverAllocated 
                  ? `+${(ownershipStats.totalAllocated - 100).toFixed(1)}%`
                  : `${ownershipStats.remainingOwnership.toFixed(1)}%`
                }
              </Typography.Text>
            </div>
          </div>

          {ownershipStats.isOverAllocated && (
            <Alert
              message="Equity Over-Allocation Warning"
              description={`Total equity allocation (${ownershipStats.totalAllocated.toFixed(1)}%) exceeds 100%. Please reduce founder ownership or ESOP pool to ensure proper allocation.`}
              type="warning"
              showIcon
              className="mb-4"
            />
          )}

          {ownershipStats.totalAllocated === 100 && (
            <Alert
              message="Perfect Equity Allocation"
              description="Equity allocation is perfectly balanced at 100%. You're ready to proceed with funding rounds."
              type="success"
              showIcon
              className="mb-4"
            />
          )}

          {ownershipStats.totalAllocated < 100 && ownershipStats.totalAllocated > 0 && (
            <Alert
              message="Incomplete Equity Allocation"
              description={`${ownershipStats.remainingOwnership.toFixed(1)}% of equity remains unallocated. Consider distributing remaining shares or adjusting allocations.`}
              type="info"
              showIcon
              className="mb-4"
            />
          )}
        </div>
      </Card>

      {/* Founders List */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="flex items-center p-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <Typography.Title level={3} className="mb-1 text-slate-800">
              Founding Team
            </Typography.Title>
            <Typography.Text className="text-slate-500">
              {founders.length} founder{founders.length !== 1 ? 's' : ''} • {ownershipStats.totalAllocated.toFixed(1)}% total ownership
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-8">
          {founders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <Typography.Title level={4} className="text-slate-600 mb-2">No Founders Added Yet</Typography.Title>
              <Typography.Text className="text-slate-500">
                Add your first founder to get started
              </Typography.Text>
            </div>
          ) : (
            <Table
              dataSource={founders}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="middle"
              className="custom-table"
            />
          )}
        </div>
      </Card>
    </div>
  );
});

FoundersTab.displayName = 'FoundersTab';

export default FoundersTab;

