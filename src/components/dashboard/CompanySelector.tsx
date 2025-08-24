'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, List, Avatar, Typography, message, Spin, Empty, Modal, Form, Input, InputNumber } from 'antd';
import { 
  BankOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  UserOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Company } from '@/types';
import { useSimulatorStore } from '@/store/simulator-store';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

interface CompanySelectorProps {
  onCompanySelect: (company: Company) => void;
  onCreateCompany: () => void;
}

interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onSelect: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = React.memo(({ 
  company, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
          : 'hover:border-blue-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(company)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Avatar 
            size={48} 
            icon={<BankOutlined />} 
            className={`${
              isSelected ? 'bg-blue-500' : 'bg-slate-500'
            }`}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Title level={4} className="mb-0 text-slate-800 truncate">
                {company.name}
              </Title>
              {isSelected && (
                <CheckCircleOutlined className="text-blue-500 text-lg" />
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Text type="secondary" className="block">Total Shares</Text>
                <Text strong className="text-slate-700">
                  {company.total_shares?.toLocaleString() || 'N/A'}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="block">Valuation</Text>
                <Text strong className="text-slate-700">
                  ${company.valuation?.toLocaleString() || 'N/A'}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="block">ESOP Pool</Text>
                <Text strong className="text-slate-700">
                  {company.esop_pool || 0}%
                </Text>
              </div>
              <div>
                <Text type="secondary" className="block">Status</Text>
                <Text strong className="text-slate-700">
                  {company.status || 'Active'}
                </Text>
              </div>
            </div>
          </div>
        </div>
        
        {isHovered && (
          <div className="flex space-x-2 ml-4">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              className="hover:bg-blue-100 hover:text-blue-600"
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company);
              }}
              className="hover:bg-red-100"
            />
          </div>
        )}
      </div>
    </Card>
  );
});

CompanyCard.displayName = 'CompanyCard';

const CompanySelector: React.FC<CompanySelectorProps> = ({ onCompanySelect, onCreateCompany }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();

  const { setCompany, clearCompany, loadUserCompanies: storeLoadUserCompanies } = useSimulatorStore();
  const { session } = useAuth();

  // Load user companies on component mount
  useEffect(() => {
    loadUserCompaniesFromAPI();
  }, []);

  const loadUserCompaniesFromAPI = async () => {
    setLoading(true);
    try {
      if (!session?.access_token) {
        message.error('No authentication session found');
        return;
      }

      // Fetch companies from API using Supabase session token
      const response = await fetch('/api/protected/companies', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const { companies } = await response.json();
      setCompanies(companies || []);
      
      // Also load companies into the store
      await storeLoadUserCompanies('current-user');
    } catch (error) {
      message.error('Failed to load companies');
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCompany(company);
    onCompanySelect(company);
    message.success(`Opening ${company.name} dashboard...`);
    
    // Navigate to user-specific company URL
    const userId = company.user_id || 'me';
    router.push(`/dashboard/${userId}/${company.id}?tab=company`);
  };

  const handleCreateCompany = async (values: any) => {
    try {
      console.log('Creating company with values:', values);
      console.log('Session:', session);
      
      if (!session?.access_token) {
        message.error('No authentication session found');
        console.error('No session or access token');
        return;
      }

      console.log('Making API request to create company...');
      
      // Create company via API using Supabase session token
      const response = await fetch('/api/protected/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          total_shares: values.total_shares,
          valuation: values.valuation,
          esop_pool: values.esop_pool
        })
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create company: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API response data:', responseData);
      
      const { company } = responseData;
      
      if (!company) {
        throw new Error('No company data returned from API');
      }
      
      // Add to local state
      setCompanies(prev => [...prev, company]);
      setSelectedCompany(company);
      setCompany(company);
      setShowCreateModal(false);
      form.resetFields();
      message.success('Company created successfully!');
      
      // Navigate to new company dashboard
      const userId = company.user_id || 'me';
      router.push(`/dashboard/${userId}/${company.id}?tab=company`);
    } catch (error) {
      console.error('Error creating company:', error);
      message.error(`Failed to create company: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditCompany = async (values: any) => {
    if (!editingCompany) return;
    
    try {
      if (!session?.access_token) {
        message.error('No authentication session found');
        return;
      }

      // Update company via API using Supabase session token
      const response = await fetch('/api/protected/companies', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingCompany.id,
          name: values.name,
          total_shares: values.total_shares,
          valuation: values.valuation,
          esop_pool: values.esop_pool
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update company: ${response.statusText}`);
      }

      const { company: updatedCompany } = await response.json();
      
      // Update local state
      setCompanies(prev => 
        prev.map(c => c.id === editingCompany.id ? updatedCompany : c)
      );
      
      if (selectedCompany?.id === editingCompany.id) {
        setSelectedCompany(updatedCompany);
        setCompany(updatedCompany);
      }
      
      setEditingCompany(null);
      form.resetFields();
      message.success('Company updated successfully!');
    } catch (error) {
      message.error('Failed to update company');
      console.error('Error updating company:', error);
    }
  };

  const handleDeleteCompany = async (company: Company) => {
    Modal.confirm({
      title: 'Delete Company',
      content: `Are you sure you want to delete "${company.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          if (!session?.access_token) {
            message.error('No authentication session found');
            return;
          }

          // Delete company via API using Supabase session token
          const response = await fetch(`/api/protected/companies?id=${company.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to delete company: ${response.statusText}`);
          }

          // Update local state
          setCompanies(prev => prev.filter(c => c.id !== company.id));
          if (selectedCompany?.id === company.id) {
            setSelectedCompany(null);
            clearCompany();
          }
          message.success('Company deleted successfully');
        } catch (error) {
          message.error('Failed to delete company');
          console.error('Error deleting company:', error);
        }
      }
    });
  };

  const openEditModal = (company: Company) => {
    setEditingCompany(company);
    form.setFieldsValue({
      name: company.name,
      total_shares: company.total_shares,
      valuation: company.valuation,
      esop_pool: company.esop_pool
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} className="mb-2 text-slate-800">
            My Companies
          </Title>
          <Text className="text-slate-600">
            Select a company to manage or create a new one
          </Text>
        </div>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 border-0"
        >
          Create Company
        </Button>
      </div>

      {/* Companies Grid */}
      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <CompanyCard
              key={company.id}
              company={company}
              isSelected={selectedCompany?.id === company.id}
              onSelect={handleCompanySelect}
              onEdit={openEditModal}
              onDelete={handleDeleteCompany}
            />
          ))}
        </div>
      ) : (
        <Empty
          description="No companies found"
          className="my-12"
        >
          <Button type="primary" onClick={() => setShowCreateModal(true)}>
            Create Your First Company
          </Button>
        </Empty>
      )}

      {/* Create Company Modal */}
      <Modal
        title="Create New Company"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCompany}
          initialValues={{
            total_shares: 10000000,
            valuation: 1000000,
            esop_pool: 10
          }}
        >
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" size="large" />
          </Form.Item>
          
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="total_shares"
              label="Total Shares"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="10,000,000"
                size="large"
                className="w-full"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              />
            </Form.Item>
            
            <Form.Item
              name="valuation"
              label="Valuation ($)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="1,000,000"
                size="large"
                className="w-full"
                formatter={value => `$ ${value}`.replace(/\$\s?|(,*)/g, ',')}
                parser={value => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              />
            </Form.Item>
            
            <Form.Item
              name="esop_pool"
              label="ESOP Pool (%)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="10"
                size="large"
                className="w-full"
                min={0}
                max={100}
                formatter={value => `${value}%`}
                parser={value => (Math.min(100, Math.max(0, parseInt(value!.replace('%', '')) || 0)) as 0 | 100)}
              />
            </Form.Item>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Company
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        title="Edit Company"
        open={!!editingCompany}
        onCancel={() => setEditingCompany(null)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditCompany}
        >
          <Form.Item
            name="name"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" size="large" />
          </Form.Item>
          
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="total_shares"
              label="Total Shares"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="10,000,000"
                size="large"
                className="w-full"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            
            <Form.Item
              name="valuation"
              label="Valuation ($)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="1,000,000"
                size="large"
                className="w-full"
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => parseInt(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              />
            </Form.Item>
            
            <Form.Item
              name="esop_pool"
              label="ESOP Pool (%)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber
                placeholder="10"
                size="large"
                className="w-full"
                min={0}
                max={100}
                formatter={value => `${value}%`}
                parser={value => (Math.min(100, Math.max(0, parseInt(value!.replace('%', '')) || 0)) as 0 | 100)}
              />
            </Form.Item>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button onClick={() => setEditingCompany(null)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Update Company
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanySelector;
