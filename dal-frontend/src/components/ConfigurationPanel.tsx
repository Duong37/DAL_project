import React from 'react';

interface ConfigurationPanelProps {
  config: any;
  onConfigChange?: (config: any) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  config, 
  onConfigChange 
}) => {
  const handleConfigChange = (key: string, value: any) => {
    if (onConfigChange) {
      const newConfig = { ...config, [key]: value };
      onConfigChange(newConfig);
    }
  };

  return (
    <div className="configuration-panel">
      <div className="panel-header">
        <h3>Configuration</h3>
      </div>
      
      <div className="info-box" style={{ marginBottom: '20px', background: '#e7f3ff', borderColor: '#b3d9ff', color: '#004085', padding: '10px', border: '1px solid', borderRadius: '4px' }}>
        <strong>Configuration in Microservices Architecture</strong><br/>
        Configuration is now handled during experiment initialization. The settings below show the current default configuration that will be used when creating new experiments. To change configuration for a new experiment, modify these settings and then initialize a new experiment.
      </div>
      
      <div className="config-section">
        <h4>AL Framework</h4>
        <div className="form-group">
          <label>Framework</label>
          <select 
            value={config.al_framework?.type || 'sklearn'} 
            onChange={(e) => handleConfigChange('al_framework', { type: e.target.value })}
          >
            <option value="sklearn">Scikit-learn</option>
            <option value="modal">modAL</option>
            <option value="alipy">ALiPy</option>
          </select>
        </div>
      </div>

      <div className="config-section">
        <h4>Model Type</h4>
        <div className="form-group">
          <label>Model</label>
          <select 
            value={config.model?.type || 'random_forest'} 
            onChange={(e) => handleConfigChange('model', { 
              ...config.model, 
              type: e.target.value 
            })}
          >
            <option value="random_forest">Random Forest</option>
            <option value="svm">Support Vector Machine</option>
            <option value="logistic_regression">Logistic Regression</option>
          </select>
        </div>
      </div>

      <div className="config-section">
        <h4>Query Strategy</h4>
        <div className="form-group">
          <label>Selection Method</label>
          <select 
            value={config.query_strategy?.type || 'uncertainty_sampling'} 
            onChange={(e) => handleConfigChange('query_strategy', { type: e.target.value })}
          >
            <option value="uncertainty_sampling">Uncertainty Sampling</option>
            <option value="random_sampling">Random Sampling</option>
            <option value="diversity_sampling">Diversity Sampling</option>
          </select>
        </div>
      </div>

      <div className="config-section">
        <h4>Dataset</h4>
        <div className="form-group">
          <label>Dataset</label>
          <select 
            value={config.dataset?.type || 'wine'} 
            onChange={(e) => handleConfigChange('dataset', { 
              ...config.dataset, 
              type: e.target.value 
            })}
          >
            <option value="wine">Wine Dataset</option>
            <option value="iris">Iris Dataset</option>
            <option value="synthetic">Synthetic Data</option>
          </select>
        </div>
      </div>

      {config.dataset?.type === 'synthetic' && (
        <div className="config-section">
          <h4>Synthetic Samples</h4>
          <div className="form-group">
            <label>Number of Samples</label>
            <input
              type="number" 
              value={config.dataset?.synthetic_samples || 100}
              onChange={(e) => handleConfigChange('dataset', { 
                ...config.dataset, 
                synthetic_samples: parseInt(e.target.value) 
              })}
              min="10"
              max="1000"
            />
          </div>
        </div>
      )}

      <div className="info-box" style={{ background: '#f8f9fa', borderColor: '#dee2e6', color: '#495057', padding: '10px', border: '1px solid', borderRadius: '4px' }}>
        <strong>How to Configure:</strong><br/>
        1. Reset the current experiment if needed<br/>
        2. Initialize a new experiment with your desired configuration<br/>
        3. The AL Engine will use these settings for the new experiment
      </div>
    </div>
  );
}; 