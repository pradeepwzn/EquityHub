'use client';

import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Typography, message, Alert } from 'antd';
import { BankOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { useCompanyStore } from '@/store/company-store';

const { Title, Text } = Typography;

interface CompanyCreationFormProps {
  onCompanyCreated?: (companyId: string) => void;
  onCancel?: () => void;
}

const CompanyCreationForm: React.FC<CompanyCreationFormProps> = ({
  onCompanyCreated,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createCompany, error, clearError } = useCompanyStore();

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      const company = createCompany({
        name: values.name,
        total_shares: values.total_shares,
        valuation: values.valuation,
        esop_pool: values.esop_pool,
      });
      
      message.success(`Company "${company.name}" created successfully!`);
      form.resetFields();
      
      // Call callback if provided
      if (onCompanyCreated) {
        onCompanyCreated(company.id);
      }
      
    } catch (error: any) {
      message.error(error.message || 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    clearError();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="flex items-center p-6 border-b border-slate-100">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
          <BankOutlined className="text-2xl text-white" />
        </div>
        <div>
          <Title level={4} className="mb-1 text-slate-800">
            Create New Company
          </Title>
          <Text className="text-slate-500">
            Set up your company profile and basic details
          </Text>
        </div>
      </div>
      
      <div className="p-6">
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={clearError}
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            total_shares: 10000000,
            valuation: 1000000,
            esop_pool: 10,
          }}
          className="max-w-2xl"
        >
          <Form.Item
            name="name"
            label={<span className="text-slate-700 font-medium">Company Name</span>}
            rules={[
              { required: true, message: 'Please enter company name' },
              { min: 2, message: 'Company name must be at least 2 characters' },
              { max: 100, message: 'Company name must be less than 100 characters' }
            ]}
          >
            <Input
              placeholder="Enter your company name"
              className="h-12 text-base border-slate-200 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              prefix={<BankOutlined className="text-slate-400 mr-2" />}
            />
          </Form.Item>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="total_shares"
              label={<span className="text-slate-700 font-medium">Total Shares</span>}
              rules={[
                { required: true, message: 'Please enter total shares' },
                { type: 'number', min: 1000, message: 'Total shares must be at least 1,000' },
                { type: 'number', max: 1000000000, message: 'Total shares must be less than 1 billion' }
              ]}
            >
              <InputNumber
                className="w-full h-12 text-base border-slate-200 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="10,000,000"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                min={1000}
                max={1000000000}
              />
            </Form.Item>
            
            <Form.Item
              name="valuation"
              label={<span className="text-slate-700 font-medium">Company Valuation ($)</span>}
              rules={[
                { required: true, message: 'Please enter company valuation' },
                { type: 'number', min: 1000, message: 'Valuation must be at least $1,000' },
                { type: 'number', max: 1000000000000, message: 'Valuation must be less than $1 trillion' }
              ]}
            >
              <InputNumber
                className="w-full h-12 text-base border-slate-200 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="1,000,000"
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                min={1000}
                max={1000000000000}
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="esop_pool"
            label={<span className="text-slate-700 font-medium">ESOP Pool (%)</span>}
            rules={[
              { required: true, message: 'Please enter ESOP pool percentage' },
              { type: 'number', min: 0, message: 'ESOP pool must be at least 0%' },
              { type: 'number', max: 100, message: 'ESOP pool must be at most 100%' }
            ]}
          >
            <InputNumber
              className="w-full h-12 text-base border-slate-200 rounded-lg hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="10"
              min={0}
              max={100}
              addonAfter="%"
            />
          </Form.Item>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              size="large"
              onClick={handleCancel}
              className="h-12 px-6"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              icon={<SaveOutlined />}
              className="h-12 px-6 bg-blue-500 hover:bg-blue-600 border-blue-500"
            >
              Create Company
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};

export default CompanyCreationForm;
