'use client';

import React from 'react';
import { Card, List, Avatar, Typography, Button, Empty, Tag, Space } from 'antd';
import { 
  BankOutlined, 
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Company } from '@/types';
import { useCompanyStore } from '@/store/company-store';

const { Title, Text } = Typography;

interface CompanyListProps {
  onCompanySelect: (company: Company) => void;
  onCreateCompany: () => void;
  onEditCompany?: (company: Company) => void;
  onDeleteCompany?: (company: Company) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({
  onCompanySelect,
  onCreateCompany,
  onEditCompany,
  onDeleteCompany
}) => {
  const { companies, currentCompany } = useCompanyStore();

  if (companies.length === 0) {
    return (
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="text-center">
              <Title level={4} className="text-slate-600 mb-2">
                No Companies Yet
              </Title>
              <Text className="text-slate-500 mb-4 block">
                Create your first company to get started with cap table modeling
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={onCreateCompany}
                className="bg-blue-500 hover:bg-blue-600 border-blue-500"
              >
                Create Company
              </Button>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <BankOutlined className="text-xl text-white" />
          </div>
          <div>
            <Title level={4} className="mb-1 text-slate-800">
              Your Companies
            </Title>
            <Text className="text-slate-500">
              {companies.length} company{companies.length !== 1 ? 's' : ''} • Select one to continue
            </Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateCompany}
          className="bg-blue-500 hover:bg-blue-600 border-blue-500"
        >
          Add Company
        </Button>
      </div>
      
      <List
        className="p-6"
        dataSource={companies}
        renderItem={(company) => {
          const isSelected = currentCompany?.id === company.id;
          
          return (
            <List.Item
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                isSelected 
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
              onClick={() => onCompanySelect(company)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar 
                    size={48} 
                    icon={<BankOutlined />} 
                    className={`${
                      isSelected ? 'bg-blue-500' : 'bg-slate-500'
                    }`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Title level={5} className="mb-0 text-slate-800 truncate">
                        {company.name}
                      </Title>
                      {isSelected && (
                        <CheckCircleOutlined className="text-blue-500 text-lg" />
                      )}
                      <Tag color={company.status === 'Active' ? 'green' : 'orange'}>
                        {company.status || 'Active'}
                      </Tag>
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
                        <Text type="secondary" className="block">Created</Text>
                        <Text strong className="text-slate-700">
                          {new Date(company.created_at).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Space className="ml-4">
                  {onEditCompany && (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCompany(company);
                      }}
                      className="text-slate-500 hover:text-blue-500"
                    />
                  )}
                  {onDeleteCompany && (
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCompany(company);
                      }}
                      className="text-red-500 hover:text-red-600"
                    />
                  )}
                </Space>
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default CompanyList;
