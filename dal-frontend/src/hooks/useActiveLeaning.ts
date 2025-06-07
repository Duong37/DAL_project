import { useState, useEffect, useCallback } from 'react';
import { DALAPIClient } from '../services/api';
import { Sample, ModelMetrics } from '../types/sample';

interface VotingHistoryAnalytics {
  total_votes: number;
  correct_votes: number;
  accuracy_rate: number;
  average_uncertainty: number;
  class_distribution: Record<string, number>;
}

interface VotingHistory {
  votes: any[];
  analytics: VotingHistoryAnalytics;
}

interface ModelUpdates {
  updates: any[];
  performance_trend: any[];
  summary: {
    total_updates: number;
    initial_accuracy: number;
    current_accuracy: number;
    total_improvement: number;
  };
}

interface BlockchainSimulation {
  on_chain: {
    vote_records: any[];
    model_updates: any[];
    total_blocks: number;
    total_gas_used: number;
    storage_size_kb: number;
  };
  off_chain: {
    vote_data: any[];
    model_data: any[];
    storage_size_kb: number;
  };
  privacy_stats: {
    data_reduction_ratio: number;
    features_hidden_on_chain: number;
    only_hashes_on_chain: number;
    full_audit_trail_available: boolean;
  };
}

export const useActiveLeaning = () => {
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [votingHistory, setVotingHistory] = useState<VotingHistory | null>(null);
  const [modelUpdates, setModelUpdates] = useState<ModelUpdates | null>(null);
  const [blockchainData, setBlockchainData] = useState<BlockchainSimulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentSample = useCallback(async () => {
    try {
      setLoading(true);
      const response = await DALAPIClient.getNextSample();
      if (response.status === 'success') {
        // Convert modern API response to expected format
        const sample = response.sample;
        setCurrentSample({
          id: sample.sample_id,
          data: sample.features,
          uncertainty: sample.uncertainty_score,
          predicted_label: sample.predicted_label,
          metadata: sample.metadata
        });
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to get sample');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sample');
      setCurrentSample(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModelStatus = useCallback(async () => {
    try {
      const response = await DALAPIClient.getMetrics();
      if (response.status === 'success') {
        setModelMetrics(response.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch model status:', err);
    }
  }, []);

  const fetchVotingHistory = useCallback(async () => {
    try {
      // For now, return empty voting history since this is handled differently in modern API
      setVotingHistory({
        votes: [],
        analytics: {
          total_votes: 0,
          correct_votes: 0,
          accuracy_rate: 0,
          average_uncertainty: 0,
          class_distribution: {}
        }
      });
    } catch (err) {
      console.error('Failed to fetch voting history:', err);
    }
  }, []);

  const fetchModelUpdates = useCallback(async () => {
    try {
      const response = await DALAPIClient.getModelUpdates();
      if (response.status === 'success') {
        setModelUpdates(response.model_updates);
      } else {
        // Return empty model updates if no experiment
        setModelUpdates({
          updates: [],
          performance_trend: [],
          summary: {
            total_updates: 0,
            initial_accuracy: 0,
            current_accuracy: 0,
            total_improvement: 0
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch model updates:', err);
    }
  }, []);

  const fetchBlockchainData = useCallback(async () => {
    try {
      const [statusResponse, blocksResponse] = await Promise.all([
        DALAPIClient.getBlockchainStatus(),
        DALAPIClient.getRecentBlocks()
      ]);

      const blocks = blocksResponse.blocks || [];
      const totalBlocks = statusResponse.total_blocks || 0;
      const totalTransactions = statusResponse.total_transactions || 0;

      setBlockchainData({
        on_chain: {
          vote_records: [],
          model_updates: blocks,
          total_blocks: totalBlocks,
          total_gas_used: 0,
          storage_size_kb: totalTransactions * 0.5
        },
        off_chain: {
          vote_data: [],
          model_data: [],
          storage_size_kb: 10.0
        },
        privacy_stats: {
          data_reduction_ratio: 0.95,
          features_hidden_on_chain: 12,
          only_hashes_on_chain: totalTransactions,
          full_audit_trail_available: true
        }
      });
    } catch (err) {
      console.error('Failed to fetch blockchain data:', err);
    }
  }, []);

  const initializeDemo = useCallback(async () => {
    try {
      setLoading(true);
      await DALAPIClient.initializeExperiment();
      // Refresh all data after initialization
      await Promise.all([
        fetchCurrentSample(),
        fetchModelStatus(),
        fetchVotingHistory(),
        fetchModelUpdates(),
        fetchBlockchainData()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize demo');
    } finally {
      setLoading(false);
    }
  }, [fetchCurrentSample, fetchModelStatus, fetchVotingHistory, fetchModelUpdates, fetchBlockchainData]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchCurrentSample(),
      fetchModelStatus(),
      fetchVotingHistory(),
      fetchModelUpdates(),
      fetchBlockchainData()
    ]);
  }, [fetchCurrentSample, fetchModelStatus, fetchVotingHistory, fetchModelUpdates, fetchBlockchainData]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    currentSample,
    modelMetrics,
    votingHistory,
    modelUpdates,
    blockchainData,
    loading,
    error,
    fetchCurrentSample,
    initializeDemo,
    refreshAll
  };
}; 