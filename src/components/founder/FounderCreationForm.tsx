'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Card, message } from 'antd';
import { UserOutlined, MailOutlined, PercentageOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Founder } from '@/types';
import { FounderFormData, useFounderStore, validateFounderData } from '@/store/founder-store';

interface FounderCreationFormProps {
  companyId: string;
  companyShares: number;
  editingFounder?: Founder | null;
  onFounderCreated?: (founder: Founder) => void;
  onFounderUpdated?: (founder: Founder) => void;
  onCancel?: () => void;
}

const FounderCreationForm: React.FC<FounderCreationFormProps> = ({
  companyId,
  companyShares,
  editingFounder,
  onFounderCreated,
  onFounderUpdated,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    createFounder, 
    updateFounder, 
    error, 
    clearError,
    getFoundersByCompany 
  } = useFounderStore();

  // Calculate remaining ownership percentage
  const existingFounders = getFoundersByCompany(companyId);
  const totalExistingOwnership = existingFounders.reduce((sum, f) => {
    if (editingFounder && f.id === editingFounder.id) {
      return sum; // Exclude the founder being edited
    }
    return sum + f.initial_ownership;
  }, 0);
  
  const remainingOwnership = 100 - totalExistingOwnership;
  const maxOwnership = editingFounder ? 
    remainingOwnership + editingFounder.initial_ownership : 
    remainingOwnership;

  // Initialize form with editing data
  useEffect(() => {
    if (editingFounder) {
      form.setFieldsValue({
        name: editingFounder.name,
        email: editingFounder.email || '',
        initial_ownership: editingFounder.initial_ownership,
        shares: editingFounder.shares
      });
    } else {
      form.resetFields();
    }
  }, [editingFounder, form]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      message.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (values: FounderFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate the data
      const validation = validateFounderData(values, companyShares);
      if (!validation.isValid) {
        message.error(validation.errors.join(', '));
        return;
      }

      // Check ownership constraints
      if (values.initial_ownership > maxOwnership) {
        message.error(`Initial ownership cannot exceed ${maxOwnership}% (remaining: ${remainingOwnership}%)`);
        return;
      }

      if (editingFounder) {
        // Update existing founder
        const updatedFounder = await updateFounder(editingFounder.id, values);
        message.success(`Founder "${updatedFounder.name}" updated successfully!`);
        onFounderUpdated?.(updatedFounder);
      } else {
        // Create new founder
        const newFounder = await createFounder(companyId, values);
        message.success(`Founder "${newFounder.name}" created successfully!`);
        onFounderCreated?.(newFounder);
      }
      
      // Reset form
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Failed to save founder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  const title = editingFounder ? 'Edit Founder' : 'Add New Founder';
  const submitText = editingFounder ? 'Update Founder' : 'Add Founder';

  return (
    <Card className="shadow-lg border-0 rounded-xl">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
            <UserOutlined className="text-xl text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <span className="text-slate-500">
              {editingFounder ? 'Update founder information' : 'Add a new founder to your company'}
            </span>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: '',
            email: '',
            initial_ownership: 0,
            shares: 0
          }}
        >
          <Form.Item
            name="name"
            label={<span className="text-slate-700 font-medium">Founder Name</span>}
            help="Enter the founder's full name (e.g., 'John Smith' or 'Sarah Johnson')"
            rules={[
              { required: true, message: 'Please enter founder name' },
              { min: 2, message: 'Founder name must be at least 2 characters' },
              { max: 100, message: 'Founder name must be less than 100 characters' }
            ]}
          >
            <Input
              placeholder="Enter founder name"
              className="h-12 text-base border-slate-200 rounded-lg hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              prefix={<UserOutlined className="text-slate-400 mr-2" />}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-slate-700 font-medium">Email (Optional)</span>}
            help="Founder's email address for account matching and communications"
          >
            <Input
              placeholder="founder@company.com"
              className="h-12 text-base border-slate-200 rounded-lg hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
              prefix={<MailOutlined className="text-slate-400 mr-2" />}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="initial_ownership"
              label={<span className="text-slate-700 font-medium">Initial Ownership (%)</span>}
              help={`Enter the founder's initial ownership percentage (max: ${maxOwnership}%)`}
              rules={[
                { required: true, message: 'Please enter initial ownership percentage' },
                { type: 'number', min: 0, message: 'Ownership must be at least 0%' },
                { type: 'number', max: maxOwnership, message: `Ownership cannot exceed ${maxOwnership}%` }
              ]}
            >
              <InputNumber
                className="w-full h-12 text-base border-slate-200 rounded-lg hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                placeholder="Enter ownership %"
                min={0}
                max={maxOwnership}
                addonAfter="%"
                prefix={<PercentageOutlined className="text-slate-400 mr-2" />}
              />
            </Form.Item>

            <Form.Item
              name="shares"
              label={<span className="text-slate-700 font-medium">Shares</span>}
              help={`Enter the number of shares allocated to this founder (max: ${companyShares.toLocaleString()})`}
              rules={[
                { required: true, message: 'Please enter number of shares' },
                { type: 'number', min: 1, message: 'Shares must be at least 1' },
                { type: 'number', max: companyShares, message: `Shares cannot exceed ${companyShares.toLocaleString()}` }
              ]}
            >
              <InputNumber
                className="w-full h-12 text-base border-slate-200 rounded-lg hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                placeholder="Enter shares"
                min={1}
                max={companyShares}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = parseInt(value!.replace(/,/g, '')) || 0;
                  return Math.max(1, Math.min(companyShares, parsed));
                }}
                prefix={<ShareAltOutlined className="text-slate-400 mr-2" />}
              />
            </Form.Item>
          </div>

          {/* Ownership Summary */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Ownership Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Existing Founders:</span>
                <span className="ml-2 font-medium text-slate-700">{totalExistingOwnership.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-500">Remaining Available:</span>
                <span className="ml-2 font-medium text-slate-700">{remainingOwnership.toFixed(1)}%</span>
              </div>
            </div>
          </div>

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
              className="h-12 px-6 bg-green-500 hover:bg-green-600 border-green-500"
            >
              {submitText}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};

export default FounderCreationForm;
