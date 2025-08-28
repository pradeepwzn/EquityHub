'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button, Input, Typography, Space, Table, message, Alert, Spin, Tag, Row, Col, Divider, Select } from 'antd';
import { DatabaseOutlined, PlayCircleOutlined, SaveOutlined, ClearOutlined, HistoryOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { supabase } from '@/lib/supabase';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface QueryResult {
  data: any[] | null;
  error: string | null;
  executionTime: number;
  rowCount: number;
  columns: string[];
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
  description?: string;
  createdAt: string;
  lastExecuted?: string;
}

const SQLEditorTab: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<QueryResult | null>(null);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [queryName, setQueryName] = useState<string>('');
  const [queryDescription, setQueryDescription] = useState<string>('');

  // Sample queries for quick start
  const sampleQueries = useMemo(() => [
    {
      name: 'View All Companies',
      query: 'SELECT * FROM companies ORDER BY created_at DESC;',
      description: 'Display all companies in the system'
    },
    {
      name: 'View All Founders',
      query: 'SELECT f.*, c.name as company_name FROM founders f JOIN companies c ON f.company_id = c.id ORDER BY f.created_at DESC;',
      description: 'Display all founders with their company names'
    },
    {
      name: 'View Funding Rounds',
      query: 'SELECT fr.*, c.name as company_name FROM funding_rounds fr JOIN companies c ON fr.company_id = c.id ORDER BY fr.created_at DESC;',
      description: 'Display all funding rounds with company names'
    },
    {
      name: 'View Scenarios',
      query: 'SELECT s.*, c.name as company_name FROM scenarios s JOIN companies c ON s.company_id = c.id ORDER BY s.created_at DESC;',
      description: 'Display all scenarios with company names'
    },
    {
      name: 'Company Statistics',
      query: `SELECT 
  c.name as company_name,
  COUNT(f.id) as founder_count,
  COUNT(fr.id) as funding_rounds_count,
  COUNT(s.id) as scenarios_count,
  c.total_shares,
  c.created_at
FROM companies c
LEFT JOIN founders f ON c.id = f.company_id
LEFT JOIN funding_rounds fr ON c.id = fr.company_id
LEFT JOIN scenarios s ON c.id = s.company_id
GROUP BY c.id, c.name, c.total_shares, c.created_at
ORDER BY c.created_at DESC;`,
      description: 'Display comprehensive company statistics'
    }
  ], []);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) {
      message.warning('Please enter a SQL query');
      return;
    }

    setIsExecuting(true);
    const startTime = performance.now();

    try {
      // Check if it's a SELECT query (safe to execute)
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery.startsWith('select')) {
        message.error('Only SELECT queries are allowed for security reasons');
        setIsExecuting(false);
        return;
      }

      const { data, error } = await supabase.rpc('execute_sql_query', {
        query_text: query
      });

      const executionTime = performance.now() - startTime;

      if (error) {
        setResults({
          data: null,
          error: error.message,
          executionTime,
          rowCount: 0,
          columns: []
        });
        message.error('Query execution failed');
      } else {
        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        setResults({
          data,
          error: null,
          executionTime,
          rowCount: data ? data.length : 0,
          columns
        });
        message.success(`Query executed successfully in ${executionTime.toFixed(2)}ms`);
      }
    } catch (error) {
      const executionTime = performance.now() - startTime;
      setResults({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
        rowCount: 0,
        columns: []
      });
      message.error('Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  }, [query]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setResults(null);
    setQueryName('');
    setQueryDescription('');
  }, []);

  const saveQuery = useCallback(() => {
    if (!query.trim() || !queryName.trim()) {
      message.warning('Please provide both query name and SQL query');
      return;
    }

    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name: queryName.trim(),
      query: query.trim(),
      description: queryDescription.trim(),
      createdAt: new Date().toISOString(),
      lastExecuted: new Date().toISOString()
    };

    setSavedQueries(prev => [newQuery, ...prev]);
    message.success('Query saved successfully');
    
    // Clear form
    setQueryName('');
    setQueryDescription('');
  }, [query, queryName, queryDescription]);

  const loadQuery = useCallback((queryId: string) => {
    const savedQuery = savedQueries.find(q => q.id === queryId);
    if (savedQuery) {
      setQuery(savedQuery.query);
      setQueryName(savedQuery.name);
      setQueryDescription(savedQuery.description || '');
      setSelectedQuery(queryId);
    }
  }, [savedQueries]);

  const deleteQuery = useCallback((queryId: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== queryId));
    message.success('Query deleted successfully');
  }, []);

  const exportResults = useCallback(() => {
    if (!results?.data) {
      message.warning('No results to export');
      return;
    }

    try {
      const csvContent = [
        results.columns.join(','),
        ...results.data.map(row => 
          results.columns.map(col => {
            const value = row[col];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sql_results_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Results exported successfully');
    } catch (error) {
      message.error('Export failed');
    }
  }, [results]);

  const loadSampleQuery = useCallback((sampleQuery: typeof sampleQueries[0]) => {
    setQuery(sampleQuery.query);
    setQueryName(sampleQuery.name);
    setQueryDescription(sampleQuery.description || '');
  }, []);

  const tableColumns = useMemo(() => {
    if (!results?.columns) return [];
    
    return results.columns.map(col => ({
      title: col,
      dataIndex: col,
      key: col,
      render: (value: any) => {
        if (value === null || value === undefined) {
          return <Text type="secondary">null</Text>;
        }
        if (typeof value === 'object') {
          return <Text code>{JSON.stringify(value)}</Text>;
        }
        if (typeof value === 'boolean') {
          return <Tag color={value ? 'green' : 'red'}>{value.toString()}</Tag>;
        }
        if (typeof value === 'number') {
          return <Text strong>{value.toLocaleString()}</Text>;
        }
        return <Text>{String(value)}</Text>;
      }
    }));
  }, [results?.columns]);

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3}>
          <DatabaseOutlined className="mr-2" />
          SQL Editor
        </Title>
        <Text type="secondary">
          Execute SQL queries to explore and analyze your startup data. Only SELECT queries are allowed for security.
        </Text>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Query Editor" size="small">
            <Space direction="vertical" className="w-full" size="small">
              <div>
                <Text strong>SQL Query:</Text>
                <TextArea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your SQL query here... (SELECT statements only)"
                  rows={8}
                  className="mt-2 sql-editor-textarea"
                />
              </div>
              
              <Row gutter={[8, 8]}>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={executeQuery}
                    loading={isExecuting}
                    disabled={!query.trim()}
                  >
                    Execute Query
                  </Button>
                </Col>
                <Col>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearQuery}
                    disabled={!query.trim()}
                  >
                    Clear
                  </Button>
                </Col>
                <Col>
                  <Button
                    icon={<SaveOutlined />}
                    onClick={saveQuery}
                    disabled={!query.trim() || !queryName.trim()}
                  >
                    Save Query
                  </Button>
                </Col>
              </Row>

              <Divider />

              <div>
                <Text strong>Query Name:</Text>
                <Input
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="Enter a name for this query"
                  className="mt-2"
                />
              </div>

              <div>
                <Text strong>Description (Optional):</Text>
                <Input
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                  placeholder="Describe what this query does"
                  className="mt-2"
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sample Queries" size="small">
            <Space direction="vertical" className="w-full" size="small">
              {sampleQueries.map((sample, index) => (
                <Card key={index} size="small" className="cursor-pointer hover:bg-gray-50" onClick={() => loadSampleQuery(sample)}>
                  <div>
                    <Text strong>{sample.name}</Text>
                    <Text type="secondary" className="block text-xs mt-1">
                      {sample.description}
                    </Text>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          <Card title="Saved Queries" size="small" className="mt-4">
            <Space direction="vertical" className="w-full" size="small">
              {savedQueries.length === 0 ? (
                <Text type="secondary">No saved queries yet</Text>
              ) : (
                savedQueries.map((savedQuery) => (
                  <Card key={savedQuery.id} size="small" className="cursor-pointer hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1" onClick={() => loadQuery(savedQuery.id)}>
                        <Text strong>{savedQuery.name}</Text>
                        <Text type="secondary" className="block text-xs mt-1">
                          {savedQuery.description}
                        </Text>
                        <Text type="secondary" className="block text-xs">
                          Created: {new Date(savedQuery.createdAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        danger
                        onClick={() => deleteQuery(savedQuery.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {results && (
        <Card title="Query Results" size="small">
          <Space direction="vertical" className="w-full" size="small">
            <Row gutter={[16, 8]} align="middle">
              <Col>
                <Text strong>Execution Time:</Text> {results.executionTime.toFixed(2)}ms
              </Col>
              <Col>
                <Text strong>Rows Returned:</Text> {results.rowCount}
              </Col>
              <Col>
                <Text strong>Columns:</Text> {results.columns.length}
              </Col>
              <Col>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={exportResults}
                  disabled={!results.data || results.data.length === 0}
                >
                  Export CSV
                </Button>
              </Col>
            </Row>

            {results.error ? (
              <Alert
                message="Query Error"
                description={results.error}
                type="error"
                showIcon
              />
            ) : (
              <div>
                {results.data && results.data.length > 0 ? (
                  <Table
                    dataSource={results.data}
                    columns={tableColumns}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                    scroll={{ x: true }}
                    size="small"
                    rowKey={(record, index) => index?.toString() || '0'}
                  />
                ) : (
                  <Alert
                    message="No Data"
                    description="Query executed successfully but returned no results"
                    type="info"
                    showIcon
                  />
                )}
              </div>
            )}
          </Space>
        </Card>
      )}

      <Alert
        message="Security Notice"
        description="Only SELECT queries are allowed for security reasons. This prevents any data modification or deletion operations."
        type="info"
        showIcon
      />
    </div>
  );
};

export default SQLEditorTab;




