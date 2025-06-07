const API_BASE_URL = 'http://localhost:8000';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function requestAPI<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = config;
  
  const url = `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Modern API helper functions for common operations
export class DALAPIClient {
  private static currentExperimentId: string | null = null;

  static async initializeExperiment(config?: any) {
    const defaultConfig = {
      experiment_id: `experiment_${Date.now()}`,
      al_framework: { type: "sklearn" },
      model: {
        type: "random_forest",
        parameters: { n_estimators: 50, random_state: 42 }
      },
      query_strategy: { type: "uncertainty_sampling" },
      dataset: { type: "wine", synthetic_samples: 50 }
    };

    const result = await requestAPI('experiments/initialize', {
      method: 'POST',
      body: config || defaultConfig
    });

    if (result.status === 'success') {
      this.currentExperimentId = result.experiment_id;
    }

    return result;
  }

  static async getSystemStatus() {
    return await requestAPI('system/status');
  }

  static async resetSystem() {
    const result = await requestAPI('system/reset', { method: 'POST' });
    this.currentExperimentId = null;
    return result;
  }

  static async getExperimentStatus() {
    if (!this.currentExperimentId) {
      return { status: 'error', error: 'No active experiment' };
    }
    return await requestAPI(`experiments/${this.currentExperimentId}/status`);
  }

  static async getNextSample() {
    if (!this.currentExperimentId) {
      throw new Error('No active experiment');
    }
    return await requestAPI(`experiments/${this.currentExperimentId}/next-sample`);
  }

  static async submitLabel(sampleId: string, label: any, metadata?: any) {
    if (!this.currentExperimentId) {
      throw new Error('No active experiment');
    }
    return await requestAPI(`experiments/${this.currentExperimentId}/submit-label`, {
      method: 'POST',
      body: { sample_id: sampleId, label, metadata }
    });
  }

  static async getMetrics() {
    if (!this.currentExperimentId) {
      throw new Error('No active experiment');
    }
    return await requestAPI(`experiments/${this.currentExperimentId}/metrics`);
  }

  static async getModelUpdates(limit = 10) {
    if (!this.currentExperimentId) {
      return { status: 'success', model_updates: { updates: [], performance_trend: [], summary: { total_updates: 0, initial_accuracy: 0, current_accuracy: 0, total_improvement: 0 } } };
    }
    return await requestAPI(`experiments/${this.currentExperimentId}/model-updates?limit=${limit}`);
  }

  static async getBlockchainStatus() {
    return await requestAPI('blockchain/status');
  }

  static async getRecentBlocks(limit = 10) {
    return await requestAPI(`blockchain/blocks?limit=${limit}`);
  }

  static getCurrentExperimentId() {
    return this.currentExperimentId;
  }

  static setCurrentExperimentId(experimentId: string) {
    this.currentExperimentId = experimentId;
  }
} 