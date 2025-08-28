'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, message } from 'antd';
import { UserOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Founder } from '@/types';
import { useCompanyStore } from '@/store/company-store';
import { useFounderStore } from '@/store/founder-store';
import FounderCreationForm from './FounderCreationForm';
import FounderList from './FounderList';

const { Title, Text } = Typography;

interface FounderManagementProps {
  onBack?: () => void;
}

const FounderManagement: React.FC<FounderManagementProps> = ({
  onBack
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);
  
  const { currentCompany } = useCompanyStore();
  const { 
    currentFounder, 
    selectFounder, 
    clearCurrentFounder,
    error,
    clearError 
  } = useFounderStore();

  // Check if we have a selected company
  if (!currentCompany) {
    return (
      <Card className="shadow-lg border-0 rounded-xl">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserOutlined className="text-2xl text-slate-400" />
          </div>
          <Title level={4} className="text-slate-600 mb-2">
            No Company Selected
          </Title>
          <Text type="secondary" className="text-slate-500 mb-4 block">
            Please select a company first to manage founders
          </Text>
          {onBack && (
            <Button 
              type="primary" 
              onClick={onBack}
              icon={<ArrowLeftOutlined />}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              Back to Company Selection
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const handleCreateFounder = () => {
    setShowCreateForm(true);
    setEditingFounder(null);
    clearCurrentFounder();
  };

  const handleFounderCreated = (founder: Founder) => {
    setShowCreateForm(false);
    message.success(`Founder "${founder.name}" added successfully!`);
    
    // Automatically select the newly created founder
    selectFounder(founder.id);
  };

  const handleFounderUpdated = (founder: Founder) => {
    setShowCreateForm(false);
    setEditingFounder(null);
    message.success(`Founder "${founder.name}" updated successfully!`);
  };

  const handleEditFounder = (founder: Founder) => {
    setEditingFounder(founder);
    setShowCreateForm(true);
    selectFounder(founder.id);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingFounder(null);
    clearCurrentFounder();
    clearError();
  };

  // Show the founder creation/editing form
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-slate-600 hover:text-slate-800"
            >
              Back to Founders
            </Button>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <Title level={4} className="text-slate-800 mb-1">
                {editingFounder ? 'Edit Founder' : 'Add New Founder'}
              </Title>
              <Text type="secondary" className="text-slate-500">
                {editingFounder ? 'Update founder information' : 'Add a new founder to your company'}
              </Text>
            </div>
          </div>
        </div>

        {/* Founder Form */}
        <FounderCreationForm
          companyId={currentCompany.id}
          companyShares={currentCompany.total_shares}
          editingFounder={editingFounder}
          onFounderCreated={handleFounderCreated}
          onFounderUpdated={handleFounderUpdated}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Show the main founder management interface
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="text-slate-600 hover:text-slate-800"
              >
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300"></div>
            </>
          )}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <UserOutlined className="text-xl text-white" />
            </div>
            <div>
              <Title level={3} className="text-slate-800 mb-1">
                Founder Management
              </Title>
              <Text type="secondary" className="text-slate-500">
                Manage founders and equity distribution for {currentCompany.name}
              </Text>
            </div>
          </div>
        </div>
        
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateFounder}
          className="bg-green-500 hover:bg-green-600 border-green-500"
        >
          Add Founder
        </Button>
      </div>

      {/* Company Info Card */}
      <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {currentCompany.name}
              </div>
              <div className="text-sm text-blue-600">Company Name</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {currentCompany.total_shares.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Total Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {currentCompany.valuation ? `$${currentCompany.valuation.toLocaleString()}` : 'Not Set'}
              </div>
              <div className="text-sm text-blue-600">Company Valuation</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Founder List */}
      <FounderList
        companyId={currentCompany.id}
        companyShares={currentCompany.total_shares}
        companyValuation={currentCompany.valuation}
        onEditFounder={handleEditFounder}
      />

      {/* Module Status */}
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg text-sm">
        <div className="font-bold">👥 Module 3 Active</div>
        <div>Founder Management System</div>
        <div>Company: {currentCompany.name}</div>
      </div>
    </div>
  );
};

export default FounderManagement;
