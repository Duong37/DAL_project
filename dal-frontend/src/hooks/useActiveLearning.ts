import { useState, useEffect, useCallback } from 'react';
import { ModelMetrics } from '../types/sample';

// Use mock server in development
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'  // json-server default port
  : 'http://localhost:8000/api';

export const useActiveLeaning = () => {
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch model metrics
  const fetchModelMetrics = useCallback(async () => {
    try {
      // In development, use the mock endpoint
      const endpoint = process.env.NODE_ENV === 'development'
        ? `${API_BASE_URL}/model/metrics`
        : `${API_BASE_URL}/model/metrics`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch model metrics');
      const data = await response.json();
      setModelMetrics(data);
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      setError('Failed to fetch model metrics');

      // For development, set mock data on error
      if (process.env.NODE_ENV === 'development') {
        setModelMetrics({
          accuracy: 0.85,
          f1Score: 0.83,
          labeledCount: 150,
          totalSamples: 1000,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, []);

  // Check training status
  const checkTrainingStatus = useCallback(async () => {
    try {
      // In development, use the mock endpoint
      const endpoint = process.env.NODE_ENV === 'development'
        ? `${API_BASE_URL}/model/status`
        : `${API_BASE_URL}/model/status`;

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch training status');
      const data = await response.json();
      setIsTraining(data.isTraining);
    } catch (error) {
      console.error('Error checking training status:', error);
      setError('Failed to check training status');

      // For development, set mock status
      if (process.env.NODE_ENV === 'development') {
        setIsTraining(false);
      }
    }
  }, []);

  // Poll for metrics and training status
  useEffect(() => {
    // Initial fetch
    fetchModelMetrics();
    checkTrainingStatus();

    // Set up polling intervals
    const metricsInterval = setInterval(fetchModelMetrics, 30000); // Every 30 seconds
    const statusInterval = setInterval(checkTrainingStatus, 5000); // Every 5 seconds

    return () => {
      clearInterval(metricsInterval);
      clearInterval(statusInterval);
    };
  }, [fetchModelMetrics, checkTrainingStatus]);

  return {
    modelMetrics,
    isTraining,
    error
  };
}; 