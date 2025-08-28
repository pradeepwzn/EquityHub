'use client';

import React, { useState } from 'react';
import { Card, Typography, Button, Modal, message, Popconfirm } from 'antd';
import { BankOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Company } from '@/types';
import { useCompanyStore } from '@/store/company-store';
import CompanyCreationForm from './CompanyCreationForm';
import CompanyList from './CompanyList';

const { Title, Text } = Typography;

interface CompanyManagementProps {
  onCompanySelected?: (company: Company) => void;
  onBack?: () => void;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({
  onCompanySelected,
  onBack
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const { 
    currentCompany, 
    selectCompany, 
    updateCompany, 
    deleteCompany, 
    clearCurrentCompany,
    error,
    clearError 
  } = useCompanyStore();

  const handleCreateCompany = () => {
    setShowCreateForm(true);
    setEditingCompany(null);
  };

  const handleCompanyCreated = (companyId: string) => {
    setShowCreateForm(false);
    message.success('Company created successfully!');
    
    // Automatically select the newly created company
    selectCompany(companyId);
    
    if (onCompanySelected) {
      const company = useCompanyStore.getState().getCompanyById(companyId);
      if (company) {
        onCompanySelected(company);
      }
    }
  };

  const handleCompanySelect = (company: Company) => {
    selectCompany(company.id);
    message.success(`Selected company: ${company.name}`);
    
    if (onCompanySelected) {
      onCompanySelected(company);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowCreateForm(true);
  };

  const handleUpdateCompany = (companyData: any) => {
    if (editingCompany) {
      try {
        updateCompany(editingCompany.id, companyData);
        message.success(`Company "${editingCompany.name}" updated successfully!`);
        setShowCreateForm(false);
        setEditingCompany(null);
      } catch (error: any) {
        message.error(error.message || 'Failed to update company');
      }
    }
  };

  const handleDeleteCompany = (company: Company) => {
    try {
      deleteCompany(company.id);
      message.success(`Company "${company.name}" deleted successfully!`);
      
      // If we deleted the current company, clear the selection
      if (currentCompany?.id === company.id) {
        clearCurrentCompany();
      }
    } catch (error: any) {
      message.error('Failed to delete company');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCompany(null);
    clearError();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="text-slate-600 hover:text-slate-800"
            />
          )}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <BankOutlined className="text-xl text-white" />
            </div>
            <div>
              <Title level={3} className="mb-1 text-slate-800">
                Company Management
              </Title>
              <Text className="text-slate-500">
                Create and manage your companies
              </Text>
            </div>
          </div>
        </div>
        
        {!showCreateForm && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateCompany}
            size="large"
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
          >
            New Company
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <Text className="text-red-700">{error}</Text>
            <Button type="text" onClick={clearError} className="text-red-500">
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Current Company Display */}
      {currentCompany && !showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BankOutlined className="text-blue-500 text-xl" />
              <div>
                <Text strong className="text-blue-800 text-base">
                  Currently Selected: {currentCompany.name}
                </Text>
                <br />
                <Text className="text-blue-600 text-sm">
                  {currentCompany.total_shares?.toLocaleString()} shares • 
                  ${currentCompany.valuation?.toLocaleString()} valuation • 
                  {currentCompany.esop_pool}% ESOP pool
                </Text>
              </div>
            </div>
            <Button
              type="text"
              onClick={clearCurrentCompany}
              className="text-blue-600 hover:text-blue-700"
            >
              Change Company
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {showCreateForm ? (
        <CompanyCreationForm
          onCompanyCreated={editingCompany ? undefined : handleCompanyCreated}
          onCancel={handleCancel}
          key={editingCompany?.id || 'create'}
        />
      ) : (
        <CompanyList
          onCompanySelect={handleCompanySelect}
          onCreateCompany={handleCreateCompany}
          onEditCompany={handleEditCompany}
          onDeleteCompany={(company) => (
            <Popconfirm
              title="Delete Company"
              description={`Are you sure you want to delete "${company.name}"? This action cannot be undone.`}
              onConfirm={() => handleDeleteCompany(company)}
              okText="Yes, Delete"
              cancelText="Cancel"
              okType="danger"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          )}
        />
      )}
    </div>
  );
};

export default CompanyManagement;
