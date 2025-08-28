import { useRef, useCallback, useEffect, useState } from 'react';

interface WorkerMessage {
  type: string;
  data?: any;
  id?: string;
}

interface WorkerResult {
  type: string;
  data: any;
  id?: string;
}

export const useWebWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const pendingRequests = useRef<Map<string, (result: any) => void>>(new Map());

  // Initialize worker
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        // Only create worker if the file exists
        workerRef.current = new Worker('/worker.js');
        
        workerRef.current.onmessage = (event: MessageEvent<WorkerResult>) => {
          const { type, data, id } = event.data;
          
          if (type === 'WORKER_READY') {
            setIsReady(true);
          } else if (id && pendingRequests.current.has(id)) {
            const resolve = pendingRequests.current.get(id)!;
            pendingRequests.current.delete(id);
            resolve(data);
            setIsCalculating(false);
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.error('Web Worker error:', error);
          setIsCalculating(false);
          setIsReady(false);
        };
        
        return () => {
          if (workerRef.current) {
            workerRef.current.terminate();
          }
        };
      } catch (error) {
        console.error('Failed to create Web Worker:', error);
        setIsReady(false);
      }
    }
  }, []);

  // Send message to worker
  const sendMessage = useCallback((message: WorkerMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'));
        return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      pendingRequests.current.set(id, resolve);
      
      setIsCalculating(true);
      
      // Set timeout for request
      setTimeout(() => {
        if (pendingRequests.current.has(id)) {
          pendingRequests.current.delete(id);
          reject(new Error('Worker request timeout'));
          setIsCalculating(false);
        }
      }, 10000); // 10 second timeout
      
      workerRef.current.postMessage({ ...message, id });
    });
  }, [isReady]);

  // Calculate ESOP stats using worker
  const calculateESOPStats = useCallback(async (data: any) => {
    try {
      const result = await sendMessage({
        type: 'CALCULATE_ESOP_STATS',
        data
      });
      return result;
    } catch (error) {
      console.error('Failed to calculate ESOP stats:', error);
      // Fallback to main thread calculation
      return calculateESOPStatsFallback(data);
    }
  }, [sendMessage]);

  // Calculate founder shares using worker
  const calculateFounderShares = useCallback(async (founders: any[]) => {
    try {
      const result = await sendMessage({
        type: 'CALCULATE_FOUNDER_SHARES',
        data: founders
      });
      return result;
    } catch (error) {
      console.error('Failed to calculate founder shares:', error);
      // Fallback to main thread calculation
      return calculateFounderSharesFallback(founders);
    }
  }, [sendMessage]);

  // Calculate funding rounds using worker
  const calculateFundingRounds = useCallback(async (fundingRounds: any[]) => {
    try {
      const result = await sendMessage({
        type: 'CALCULATE_FUNDING_ROUNDS',
        data: fundingRounds
      });
      return result;
    } catch (error) {
      console.error('Failed to calculate funding rounds:', error);
      // Fallback to main thread calculation
      return calculateFundingRoundsFallback(fundingRounds);
    }
  }, [sendMessage]);

  // Batch calculations
  const performBatchCalculations = useCallback(async (data: any) => {
    try {
      const result = await sendMessage({
        type: 'BATCH_CALCULATIONS',
        data
      });
      return result;
    } catch (error) {
      console.error('Failed to perform batch calculations:', error);
      // Fallback to main thread calculations
      return performBatchCalculationsFallback(data);
    }
  }, [sendMessage]);

  // Fallback functions for when worker fails
  const calculateESOPStatsFallback = (data: any) => {
    const { company, founders, fundingRounds } = data;
    
    if (!company?.total_shares) return null;
    
    const totalShares = company.total_shares;
    const esopPoolPercent = company.esop_pool || 10;
    const esopShares = Math.floor((totalShares * esopPoolPercent) / 100);
    
    let totalFounderShares = 0;
    if (founders?.length) {
      for (let i = 0; i < founders.length; i++) {
        totalFounderShares += founders[i].shares || 0;
      }
    }
    
    let totalRoundShares = 0;
    if (fundingRounds?.length) {
      for (let i = 0; i < fundingRounds.length; i++) {
        totalRoundShares += fundingRounds[i].shares_issued || 0;
      }
    }
    
    const totalAllocatedShares = totalFounderShares + totalRoundShares;
    const availableShares = Math.max(0, totalShares - totalAllocatedShares);
    const allocatedESOPShares = Math.min(esopShares, availableShares);
    
    return {
      totalShares,
      esopPoolPercent,
      esopShares,
      allocatedESOPShares,
      availableShares,
      totalAllocatedShares,
      remainingESOPShares: Math.max(0, esopShares - allocatedESOPShares),
      totalFounderShares,
      totalRoundShares
    };
  };

  const calculateFounderSharesFallback = (founders: any[]) => {
    if (!founders?.length) return 0;
    let total = 0;
    for (let i = 0; i < founders.length; i++) {
      total += founders[i].shares || 0;
    }
    return total;
  };

  const calculateFundingRoundsFallback = (fundingRounds: any[]) => {
    if (!fundingRounds?.length) return 0;
    let total = 0;
    for (let i = 0; i < fundingRounds.length; i++) {
      total += fundingRounds[i].shares_issued || 0;
    }
    return total;
  };

  const performBatchCalculationsFallback = (data: any) => {
    const results: any = {};
    
    if (data.esopStats) {
      results.esopStats = calculateESOPStatsFallback(data.esopStats);
    }
    
    if (data.founders) {
      results.founderShares = calculateFounderSharesFallback(data.founders);
    }
    
    if (data.fundingRounds) {
      results.fundingRounds = calculateFundingRoundsFallback(data.fundingRounds);
    }
    
    results.performance = {
      timestamp: Date.now(),
      workerId: 'fallback'
    };
    
    return results;
  };

  return {
    isReady,
    isCalculating,
    calculateESOPStats,
    calculateFounderShares,
    calculateFundingRounds,
    performBatchCalculations
  };
};


