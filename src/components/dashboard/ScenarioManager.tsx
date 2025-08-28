'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, List, message, Typography, Space, Tag, Modal, Form, Popconfirm } from 'antd';
import { SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { Founder, FundingRound, Scenario } from '@/types';


interface ScenarioManagerProps {
  companyId: string;
  currentScenario: {
    founders: Founder[];
    fundingRounds: FundingRound[];
    exitValue: number;
    esopAllocation: number;
    totalShares: number;
    valuation?: number;
  };
  onScenarioSelect: (scenario: Scenario) => void;
}

// Memoized component to prevent unnecessary re-renders
const ScenarioManager = React.memo(({ companyId, currentScenario, onScenarioSelect }: ScenarioManagerProps) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Memoize event handlers to prevent unnecessary re-renders
  const fetchScenarios = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      // Mock API call since we don't need authentication
      const response = await fetch(`/api/scenarios?companyId=${companyId}`);
      const result = await response.json();
      
      if (result.success) {
        setScenarios(result.data || []);
      } else {
        message.error('Failed to fetch scenarios');
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      message.error('Error fetching scenarios');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  // Fetch scenarios on component mount with cleanup and debouncing
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    if (companyId) {
      // Debounce the fetch to prevent rapid calls
      timeoutId = setTimeout(() => {
        if (isMounted) {
          fetchScenarios();
        }
      }, 100);
    }
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [companyId, fetchScenarios]);

  const handleSaveScenario = useCallback(async () => {
    if (!scenarioName.trim()) {
      message.error('Please enter a scenario name');
      return;
    }

    try {
      const config = {
        founders: currentScenario.founders,
        funding_rounds: currentScenario.fundingRounds,
        exit_value: currentScenario.exitValue,
        esop_allocation: currentScenario.esopAllocation,
        total_shares: currentScenario.totalShares,
        company_valuation: currentScenario.valuation
      };

      // Mock API call since we don't need authentication
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          name: scenarioName.trim(),
          config
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('Scenario saved successfully!');
        setScenarioName('');
        setIsModalVisible(false);
        fetchScenarios(); // Refresh the list
      } else {
        message.error(result.error || 'Failed to save scenario');
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
      message.error('Error saving scenario');
    }
  }, [scenarioName, currentScenario, companyId, fetchScenarios]);

  const handleUpdateScenario = async () => {
    if (!editingScenario || !scenarioName.trim()) {
      message.error('Please enter a scenario name');
      return;
    }

    try {
      // Mock API call since we don't need authentication
      const response = await fetch(`/api/scenarios/${editingScenario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scenarioName.trim()
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('Scenario updated successfully!');
        setScenarioName('');
        setEditingScenario(null);
        setIsEditing(false);
        fetchScenarios(); // Refresh the list
      } else {
        message.error(result.error || 'Failed to update scenario');
      }
    } catch (error) {
      console.error('Error updating scenario:', error);
      message.error('Error updating scenario');
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      // Mock API call since we don't need authentication
      const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('Scenario deleted successfully!');
        fetchScenarios(); // Refresh the list
      } else {
        message.error(result.error || 'Failed to delete scenario');
      }
    } catch (error) {
      console.error('Error deleting scenario:', error);
      message.error('Error deleting scenario');
    }
  };

  const openEditModal = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setScenarioName(scenario.name);
    setIsEditing(true);
    setIsModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingScenario(null);
    setScenarioName('');
    setIsEditing(false);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingScenario(null);
    setScenarioName('');
    setIsEditing(false);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <FolderOutlined className="text-xl text-white" />
          </div>
          <div>
            <Typography.Title level={4} className="mb-1 text-slate-800">
              Scenario Manager
            </Typography.Title>
            <Typography.Text className="text-slate-500">
              Save and manage different exit scenarios
            </Typography.Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
          className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Save Current Scenario
        </Button>
      </div>

      <div className="p-6">
        {scenarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOutlined className="text-2xl text-slate-400" />
            </div>
            <Typography.Title level={5} className="text-slate-600 mb-2">
              No Scenarios Yet
            </Typography.Title>
            <Typography.Text className="text-slate-500">
              Save your first scenario to start comparing different exit strategies
            </Typography.Text>
          </div>
        ) : (
          <List
            dataSource={scenarios}
            renderItem={(scenario) => (
              <List.Item
                className="border border-slate-200 rounded-xl p-4 mb-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onScenarioSelect(scenario)}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(scenario);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Delete Scenario"
                    description="Are you sure you want to delete this scenario? This action cannot be undone."
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteScenario(scenario.id);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center space-x-3">
                      <Typography.Text strong className="text-slate-800">
                        {scenario.name}
                      </Typography.Text>
                      <Tag color="purple" className="text-xs">
                        {scenario.config.founders.length} Founders
                      </Tag>
                      <Tag color="blue" className="text-xs">
                        {scenario.config.funding_rounds.length} Rounds
                      </Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>Exit Value: {formatCurrency(scenario.config.exit_value)}</span>
                        <span>ESOP: {scenario.config.esop_allocation}%</span>
                        <span>Total Shares: {scenario.config.total_shares.toLocaleString()}</span>
                      </div>
                      <Typography.Text className="text-xs text-slate-500">
                        Created: {new Date(scenario.created_at).toLocaleDateString()}
                      </Typography.Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <FolderOutlined className="text-purple-600" />
            <span>{isEditing ? 'Edit Scenario' : 'Save New Scenario'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={isEditing ? handleUpdateScenario : handleSaveScenario}
        onCancel={closeModal}
        okText={isEditing ? 'Update' : 'Save'}
        okButtonProps={{
          icon: isEditing ? <EditOutlined /> : <SaveOutlined />,
          className: 'bg-gradient-to-r from-purple-600 to-pink-600 border-0'
        }}
        cancelButtonProps={{
          className: 'border-slate-300 text-slate-600'
        }}
      >
        <div className="space-y-4">
          <div>
            <Typography.Text strong className="text-slate-700 block mb-2">
              Scenario Name
            </Typography.Text>
            <Input
              placeholder="e.g., Aggressive Growth, Lean Path, Conservative Exit"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="h-12 text-lg border-2 border-slate-300 rounded-xl hover:border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
            />
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl">
            <Typography.Text strong className="text-slate-700 block mb-2">
              Current Configuration
            </Typography.Text>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Exit Value:</span>
                <span className="ml-2 font-semibold">{formatCurrency(currentScenario.exitValue)}</span>
              </div>
              <div>
                <span className="text-slate-600">ESOP Pool:</span>
                <span className="ml-2 font-semibold">{currentScenario.esopAllocation}%</span>
              </div>
              <div>
                <span className="text-slate-600">Founders:</span>
                <span className="ml-2 font-semibold">{currentScenario.founders.length}</span>
              </div>
              <div>
                <span className="text-slate-600">Funding Rounds:</span>
                <span className="ml-2 font-semibold">{currentScenario.fundingRounds.length}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
});

ScenarioManager.displayName = 'ScenarioManager';

export default ScenarioManager;
