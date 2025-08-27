'use client';

import React, { useMemo } from 'react';
import { Table } from 'antd';

interface RoundBreakdown {
  key: string;
  roundName: string;
  preMoneyValuation: number;
  postMoneyValuation: number;
  capitalRaised: number;
  sharesIssued: number;
  pricePerShare: number;
  founderOwnershipBefore: number;
  founderOwnershipAfter: number;
  cumulativeDilution: number;
  roundType: string;
}

interface StakeholderOwnership {
  name: string;
  shares: number;
  ownershipPercent: number;
  currentValue: number;
  exitValue: number;
  returnMultiple?: number;
}

interface ResultsTableProps {
  roundBreakdown: RoundBreakdown[];
  currentOwnership: StakeholderOwnership[];
  founderReturns: any[];
}

const ResultsTable: React.FC<ResultsTableProps> = React.memo(({ 
  roundBreakdown, 
  currentOwnership, 
  founderReturns 
}) => {
  // Memoized table columns for better performance
  const roundColumns = useMemo(() => [
    {
      title: 'Round',
      dataIndex: 'roundName',
      key: 'roundName',
      width: 120,
      fixed: 'left' as const,
    },
    {
      title: 'Pre-Money',
      dataIndex: 'preMoneyValuation',
      key: 'preMoneyValuation',
      width: 120,
      render: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Post-Money',
      dataIndex: 'postMoneyValuation',
      key: 'postMoneyValuation',
      width: 120,
      render: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Capital Raised',
      dataIndex: 'capitalRaised',
      key: 'capitalRaised',
      width: 120,
      render: (value: number) => `$${(value / 1000000).toFixed(1)}M`,
    },
    {
      title: 'Founder % Before',
      dataIndex: 'founderOwnershipBefore',
      key: 'founderOwnershipBefore',
      width: 140,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: 'Founder % After',
      dataIndex: 'founderOwnershipAfter',
      key: 'founderOwnershipAfter',
      width: 140,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: 'Cumulative Dilution',
      dataIndex: 'cumulativeDilution',
      key: 'cumulativeDilution',
      width: 140,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
  ], []);

  const ownershipColumns = useMemo(() => [
    {
      title: 'Stakeholder',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      width: 100,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Ownership %',
      dataIndex: 'ownershipPercent',
      key: 'ownershipPercent',
      width: 120,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: 'Current Value',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 140,
      render: (value: number) => `$${(value / 1000000).toFixed(2)}M`,
    },
    {
      title: 'Exit Value',
      dataIndex: 'exitValue',
      key: 'exitValue',
      width: 140,
      render: (value: number) => `$${(value / 1000000).toFixed(2)}M`,
    },
    {
      title: 'Return Multiple',
      dataIndex: 'returnMultiple',
      key: 'returnMultiple',
      width: 140,
      render: (value: number) => value ? `${value.toFixed(1)}x` : '-',
    },
  ], []);

  const founderColumns = useMemo(() => [
    {
      title: 'Founder',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      width: 100,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Ownership %',
      dataIndex: 'ownershipPercent',
      key: 'ownershipPercent',
      width: 120,
      render: (value: number) => `${value.toFixed(2)}%`,
    },
    {
      title: 'Exit Value',
      dataIndex: 'exitValue',
      key: 'exitValue',
      width: 140,
      render: (value: number) => `$${(value / 1000000).toFixed(2)}M`,
    },
    {
      title: 'Return Multiple',
      dataIndex: 'returnMultiple',
      key: 'returnMultiple',
      width: 140,
      render: (value: number) => value ? `${value.toFixed(1)}x` : '-',
    },
  ], []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800">Round-by-Round Breakdown</h3>
        </div>
        <Table
          dataSource={roundBreakdown}
          columns={roundColumns}
          pagination={false}
          size="small"
          className="custom-table"
          scroll={{ x: 800 }}
          rowKey="key"
        />
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800">Current Ownership Breakdown</h3>
        </div>
        <Table
          dataSource={currentOwnership}
          columns={ownershipColumns}
          pagination={false}
          size="small"
          className="custom-table"
          scroll={{ x: 800 }}
          rowKey="name"
        />
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800">Founder Returns at Exit</h3>
        </div>
        <Table
          dataSource={founderReturns}
          columns={founderColumns}
          pagination={false}
          size="small"
          className="custom-table"
          scroll={{ x: 600 }}
          rowKey="key"
        />
      </div>
    </div>
  );
});

ResultsTable.displayName = 'ResultsTable';

export default ResultsTable;





