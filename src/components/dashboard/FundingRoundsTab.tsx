'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Card, Button, Form, InputNumber, Typography, Table, message, Input, Space, Tag, Modal, Select, Switch, Divider, Row, Col } from 'antd';
import { FundProjectionScreenOutlined, PlusOutlined, DeleteOutlined, DollarOutlined, RiseOutlined, EditOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Company, FundingRound } from '@/types';

const { Option } = Select;

interface FundingRoundsTabProps {
  company: Company | null;
  fundingRounds: FundingRound[];
  onAddFundingRound: (values: any) => void;
  onRemoveFundingRound: (roundId: string) => void;
  onTabChange: (key: string) => void;
  onUpdateAndRecalculate?: () => void;
  exitResults?: any;
}

// Memoized component to prevent unnecessary re-renders
const FundingRoundsTab = React.memo(({ 
  company, 
  fundingRounds, 
  onAddFundingRound, 
  onRemoveFundingRound, 
  onUpdateAndRecalculate,
  exitResults
}: FundingRoundsTabProps) => {
  const [form] = Form.useForm();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback((values: any) => {
    // Calculate post-money valuation based on valuation type
    let preMoneyValuation = values.pre_money_valuation;
    let postMoneyValuation = values.pre_money_valuation;
    
    if (values.valuation_type === 'post_money') {
      preMoneyValuation = values.pre_money_valuation - values.investment_amount;
      postMoneyValuation = values.pre_money_valuation;
    } else {
      preMoneyValuation = values.pre_money_valuation;
      postMoneyValuation = values.pre_money_valuation + values.investment_amount;
    }

    // Calculate shares issued for priced rounds
    let sharesIssued = 0;
    let pricePerShare = 0;
    
    if (values.round_type === 'Priced Round') {
      pricePerShare = preMoneyValuation / (company?.total_shares || 10000000);
      sharesIssued = Math.floor(values.investment_amount / pricePerShare);
    }

    const fundingRoundData = {
      ...values,
      pre_money_valuation: preMoneyValuation,
      post_money_valuation: postMoneyValuation,
      shares_issued: sharesIssued,
      price_per_share: pricePerShare,
      order: fundingRounds.length + 1,
    };

    onAddFundingRound(fundingRoundData);
    form.resetFields();
    message.success('Funding round added successfully');
  }, [onAddFundingRound, form, fundingRounds.length, company?.total_shares]);

  const handleRemoveFundingRound = useCallback((roundId: string) => {
    Modal.confirm({
      title: 'Remove Funding Round',
      content: 'Are you sure you want to remove this funding round?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        onRemoveFundingRound(roundId);
        message.success('Funding round removed successfully');
      },
    });
  }, [onRemoveFundingRound]);

  // Memoize expensive calculations
  const summaryStats = useMemo(() => {
    const totalInvestment = fundingRounds.reduce((sum, round) => sum + (round.investment_amount || 0), 0);
    const totalSharesIssued = fundingRounds.reduce((sum, round) => sum + (round.shares_issued || 0), 0);
    const averagePricePerShare = totalSharesIssued > 0 ? totalInvestment / totalSharesIssued : 0;
    
    return {
      totalInvestment,
      totalSharesIssued,
      averagePricePerShare
    };
  }, [fundingRounds]);

  // Memoize table columns to prevent recreation on every render
  const columns = useMemo(() => [
    {
      title: 'Round Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FundingRound) => (
        <div className="flex items-center">
          <DollarOutlined className="text-green-600 mr-2" />
          <span className="font-medium">{text}</span>
          <Tag color={record.round_type === 'SAFE' ? 'blue' : 'green'} className="ml-2">
            {record.round_type}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Investment',
      dataIndex: 'investment_amount',
      key: 'investment_amount',
      render: (value: number) => `$${value?.toLocaleString() || '0'}`,
    },
    {
      title: 'Valuation',
      key: 'valuation',
      render: (_: unknown, record: FundingRound) => (
        <div>
          <div className="text-sm text-slate-500">
            {record.valuation_type === 'pre_money' ? 'Pre-Money' : 'Post-Money'}
          </div>
          <div className="font-medium">
            ${record.pre_money_valuation?.toLocaleString() || '0'}
          </div>
        </div>
      ),
    },
    {
      title: 'Post-Money',
      dataIndex: 'post_money_valuation',
      key: 'post_money_valuation',
      render: (value: number) => `$${value?.toLocaleString() || '0'}`,
    },
    {
      title: 'Details',
      key: 'details',
      render: (_: unknown, record: FundingRound) => (
        <div className="space-y-1">
          {record.round_type === 'Priced Round' && (
            <>
              <div className="text-sm">
                <span className="text-slate-500">Shares:</span> {record.shares_issued?.toLocaleString() || '0'}
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Price:</span> ${record.price_per_share?.toFixed(2) || '0.00'}
              </div>
            </>
          )}
          {record.round_type === 'SAFE' && record.safe_terms && (
            <>
              <div className="text-sm">
                <span className="text-slate-500">Cap:</span> ${record.safe_terms.valuation_cap?.toLocaleString() || '0'}
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Discount:</span> {record.safe_terms.discount_percentage || 0}%
              </div>
            </>
          )}
          {record.esop_adjustment && (
            <div className="text-sm">
              <span className="text-slate-500">ESOP:</span> +{record.esop_adjustment.pool_size?.toLocaleString() || '0'} shares
            </div>
          )}
          {record.founder_secondary_sale?.enabled && (
            <div className="text-sm">
              <span className="text-slate-500">Secondary:</span> {record.founder_secondary_sale.shares_sold?.toLocaleString() || '0'} shares
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: FundingRound) => (
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
            onClick={() => handleRemoveFundingRound(record.id)}
          />
        </Space>
      ),
    },
  ], [handleRemoveFundingRound]);

  return (
    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
      {/* Add Funding Round Form */}
      <Card className="shadow-xl border-0 rounded-3xl overflow-hidden">
        <div className="flex items-center p-6 sm:p-8 lg:p-10 border-b border-slate-100">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-6">
            <RiseOutlined className="text-3xl text-white" />
          </div>
          <div>
            <Typography.Title level={3} className="mb-2 text-slate-800">
              Add Funding Round
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-base">
              Configure investment rounds with advanced options
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-6 sm:p-8 lg:p-10">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="max-w-6xl"
            initialValues={{
              round_type: 'Priced Round',
              valuation_type: 'pre_money',
              esop_adjustment: {
                add_new_pool: false,
                pool_size: 0,
                is_pre_money: true
              },
              founder_secondary_sale: {
                enabled: false,
                shares_sold: 0,
                sale_price_per_share: 0
              },
              safe_terms: {
                valuation_cap: 0,
                discount_percentage: 20,
                conversion_trigger: 'next_round'
              }
            }}
          >
            {/* Basic Round Information */}
            <div className="mb-10">
              <Typography.Title level={4} className="mb-6 text-slate-700">
                Basic Round Information
              </Typography.Title>
              <Row gutter={[24, 24]}>
                <Col span={8}>
                  <Form.Item
                    name="name"
                    label={<span className="text-slate-700 font-medium">Round Name</span>}
                    rules={[{ required: true, message: 'Please enter round name' }]}
                  >
                    <Input
                      placeholder="e.g., Seed, Series A, Series B"
                      className="h-14 text-base rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="round_type"
                    label={<span className="text-slate-700 font-medium">Round Type</span>}
                    rules={[{ required: true, message: 'Please select round type' }]}
                  >
                    <Select className="h-14 text-base rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500">
                      <Option value="Priced Round">Priced Round</Option>
                      <Option value="SAFE">SAFE (Convertible)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="investment_amount"
                    label={<span className="text-slate-700 font-medium">Investment Amount ($)</span>}
                    rules={[
                      { required: true, message: 'Please enter investment amount' },
                      { type: 'number', min: 1000, message: 'Investment must be at least $1,000' }
                    ]}
                  >
                    <InputNumber
                      className="w-full h-14 text-base rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
                      placeholder="Investment amount"
                      formatter={(value: number | undefined) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || ''}
                      parser={(value: string | undefined) => parseInt(value?.replace(/\D/g, '') || '0')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="valuation_type"
                    label={<span className="text-slate-700 font-medium">Valuation Type</span>}
                    rules={[{ required: true, message: 'Please select valuation type' }]}
                  >
                    <Select className="h-12 text-base">
                      <Option value="pre_money">Pre-Money Valuation</Option>
                      <Option value="post_money">Post-Money Valuation</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="pre_money_valuation"
                    label={<span className="text-slate-700 font-medium">Valuation ($)</span>}
                    rules={[
                      { required: true, message: 'Please enter valuation' },
                      { type: 'number', min: 1000, message: 'Valuation must be at least $1,000' }
                    ]}
                  >
                    <InputNumber
                      className="w-full h-12 text-base"
                      placeholder="Company valuation"
                      formatter={(value: number | undefined) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || ''}
                      parser={(value: string | undefined) => parseInt(value?.replace(/\D/g, '') || '0')}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="esop_allocation_percent"
                    label={<span className="text-slate-700 font-medium">ESOP Allocation (%)</span>}
                  >
                    <InputNumber
                      className="w-full h-12 text-base"
                      placeholder="ESOP percentage"
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mb-6">
              <Button
                type="link"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
              >
                {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              </Button>
            </div>

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <>
                {/* SAFE Terms */}
                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.round_type !== currentValues.round_type}>
                  {({ getFieldValue }) => 
                    getFieldValue('round_type') === 'SAFE' && (
                      <div className="mb-8">
                        <Typography.Title level={4} className="mb-4 text-slate-700">
                          SAFE Terms
                        </Typography.Title>
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              name={['safe_terms', 'valuation_cap']}
                              label={<span className="text-slate-700 font-medium">Valuation Cap ($)</span>}
                            >
                              <InputNumber
                                className="w-full h-12 text-base"
                                placeholder="Valuation cap"
                                formatter={(value: number | undefined) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || ''}
                                parser={(value: string | undefined) => parseInt(value?.replace(/\D/g, '') || '0')}
                                min={0}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name={['safe_terms', 'discount_percentage']}
                              label={<span className="text-slate-700 font-medium">Discount (%)</span>}
                            >
                              <InputNumber
                                className="w-full h-12 text-base"
                                placeholder="Discount percentage"
                                min={0}
                                max={100}
                                step={1}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              name={['safe_terms', 'conversion_trigger']}
                              label={<span className="text-slate-700 font-medium">Conversion Trigger</span>}
                            >
                              <Select className="h-12 text-base">
                                <Option value="next_round">Next Round</Option>
                                <Option value="exit">Exit</Option>
                                <Option value="ipo">IPO</Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    )
                  }
                </Form.Item>

                {/* ESOP Adjustment */}
                <div className="mb-8">
                  <Typography.Title level={4} className="mb-4 text-slate-700">
                    ESOP Pool Adjustment
                  </Typography.Title>
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Form.Item
                        name={['esop_adjustment', 'add_new_pool']}
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Typography.Text className="text-slate-700 font-medium">Add/Expand ESOP Pool</Typography.Text>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                          prevValues.esop_adjustment?.add_new_pool !== currentValues.esop_adjustment?.add_new_pool
                        }
                      >
                        {({ getFieldValue }) => 
                          getFieldValue(['esop_adjustment', 'add_new_pool']) && (
                            <Form.Item
                              name={['esop_adjustment', 'pool_size']}
                              className="mb-0"
                            >
                              <InputNumber
                                className="w-full h-12 text-base"
                                placeholder="Pool size (shares)"
                                min={0}
                              />
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                          prevValues.esop_adjustment?.add_new_pool !== currentValues.esop_adjustment?.add_new_pool
                        }
                      >
                        {({ getFieldValue }) => 
                          getFieldValue(['esop_adjustment', 'add_new_pool']) && (
                            <Form.Item
                              name={['esop_adjustment', 'is_pre_money']}
                              className="mb-0"
                            >
                              <Select className="h-12 text-base">
                                <Option value={true}>Pre-Money</Option>
                                <Option value={false}>Post-Money</Option>
                              </Select>
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Founder Secondary Sale */}
                <div className="mb-8">
                  <Typography.Title level={4} className="mb-4 text-slate-700">
                    Founder Secondary Sale
                  </Typography.Title>
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Form.Item
                        name={['founder_secondary_sale', 'enabled']}
                        valuePropName="checked"
                        className="mb-0"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Typography.Text className="text-slate-700 font-medium">Enable Secondary Sale</Typography.Text>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                          prevValues.founder_secondary_sale?.enabled !== currentValues.founder_secondary_sale?.enabled
                        }
                      >
                        {({ getFieldValue }) => 
                          getFieldValue(['founder_secondary_sale', 'enabled']) && (
                            <Form.Item
                              name={['founder_secondary_sale', 'shares_sold']}
                              className="mb-0"
                            >
                              <InputNumber
                                className="w-full h-12 text-base"
                                placeholder="Shares to sell"
                                min={0}
                              />
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                          prevValues.founder_secondary_sale?.enabled !== currentValues.founder_secondary_sale?.enabled
                        }
                      >
                        {({ getFieldValue }) => 
                          getFieldValue(['founder_secondary_sale', 'enabled']) && (
                            <Form.Item
                              name={['founder_secondary_sale', 'sale_price_per_share']}
                              className="mb-0"
                            >
                              <InputNumber
                                className="w-full h-12 text-base"
                                placeholder="Sale price per share"
                                min={0}
                                step={0.01}
                              />
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </>
            )}

            <Divider />

            <div className="flex justify-end pt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<PlusOutlined />}
                size="large"
                className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
              >
                Add Funding Round
              </Button>
            </div>
          </Form>
        </div>
      </Card>

      {/* Funding Rounds List */}
      <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
        <div className="flex items-center p-8 border-b border-slate-100">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
            <DollarOutlined className="text-2xl text-white" />
          </div>
          <div>
            <Typography.Title level={3} className="mb-1 text-slate-800">
              Funding Rounds
            </Typography.Title>
            <Typography.Text className="text-slate-500">
              {fundingRounds.length} round{fundingRounds.length !== 1 ? 's' : ''} • Total raised: ${summaryStats.totalInvestment.toLocaleString()}
            </Typography.Text>
          </div>
        </div>
        
        <div className="p-8">
          {fundingRounds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiseOutlined className="text-4xl text-slate-400" />
              </div>
              <Typography.Title level={4} className="text-slate-600 mb-2">No Funding Rounds Yet</Typography.Title>
              <Typography.Text className="text-slate-500">
                Add your first funding round to see dilution effects
              </Typography.Text>
            </div>
          ) : (
            <>
              <Table
                dataSource={fundingRounds}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="middle"
                className="custom-table mb-8"
              />
              
              {/* Update & Recalculate Button */}
              <div className="flex justify-center pt-6 border-t border-slate-100">
                <Button 
                  type="primary" 
                  icon={<RiseOutlined />}
                  size="large"
                  onClick={onUpdateAndRecalculate}
                  className="bg-gradient-to-r from-green-600 to-blue-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 h-12 px-8 text-base font-medium"
                >
                  Update & Recalculate Scenario
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Ownership Summary */}
      {exitResults?.ownershipBreakdown && (
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="flex items-center p-8 border-b border-slate-100">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <TeamOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Typography.Title level={3} className="mb-1 text-slate-800">
                Current Ownership & Valuation
              </Typography.Title>
              <Typography.Text className="text-slate-500">
                Post-funding round breakdown • Current Valuation: ${exitResults.currentValuation?.toLocaleString() || '0'}
              </Typography.Text>
            </div>
          </div>
          
          <div className="p-8">
            <Row gutter={24}>
              {/* Founders */}
              <Col span={12}>
                <Typography.Title level={4} className="mb-4 text-slate-700">
                  Founders
                </Typography.Title>
                <div className="space-y-3">
                  {exitResults.ownershipBreakdown.founders.map((founder: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">{founder.name}</div>
                        <div className="text-sm text-slate-500">
                          {founder.shares.toLocaleString()} shares ({founder.ownershipPercent.toFixed(2)}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-800">
                          ${founder.currentValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500">
                          Exit: ${founder.exitValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
              
              {/* Investors & ESOP */}
              <Col span={12}>
                <Typography.Title level={4} className="mb-4 text-slate-700">
                  Investors & ESOP
                </Typography.Title>
                <div className="space-y-3">
                  {exitResults.ownershipBreakdown.investors.map((investor: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-800">{investor.roundName}</div>
                        <div className="text-sm text-slate-500">
                          {investor.shares.toLocaleString()} shares ({investor.ownershipPercent.toFixed(2)}%)
                        </div>
                        <div className="text-xs text-blue-600">
                          Invested: ${investor.investmentAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-800">
                          ${investor.currentValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500">
                          {investor.returnMultiple.toFixed(2)}x return
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* ESOP Pool */}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-800">ESOP Pool</div>
                      <div className="text-sm text-slate-500">
                        {exitResults.ownershipBreakdown.esop.shares.toLocaleString()} shares ({exitResults.ownershipBreakdown.esop.ownershipPercent.toFixed(2)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">
                        ${exitResults.ownershipBreakdown.esop.currentValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Available Shares */}
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-800">Available</div>
                      <div className="text-sm text-slate-500">
                        {exitResults.ownershipBreakdown.available.shares.toLocaleString()} shares ({exitResults.ownershipBreakdown.available.ownershipPercent.toFixed(2)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-800">
                        ${exitResults.ownershipBreakdown.available.currentValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            
            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Row gutter={16}>
                <Col span={6}>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">
                      ${exitResults.currentValuation?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-500">Current Valuation</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">
                      {exitResults.totalSharesOutstanding?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-500">Total Shares</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">
                      ${exitResults.sharePrice?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-slate-500">Share Price</div>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <div className="text-2xl font-bold text-slate-800">
                      ${exitResults.totalFounderValue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-500">Founder Value</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

FundingRoundsTab.displayName = 'FundingRoundsTab';

export default FundingRoundsTab;

