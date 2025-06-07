import React, { useState } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
`;

const ConfigSection = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const SectionTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  color: #495057;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const InfoBox = styled.div`
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
  font-size: 13px;
  color: #0c5460;
`;

interface ConfigurationPanelProps {
  onConfigChange?: () => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onConfigChange }) => {
  const [updateStrategy, setUpdateStrategy] = useState('single');
  const [batchSize, setBatchSize] = useState(3);
  const [queryMethod, setQueryMethod] = useState('max_entropy');

  return (
    <Container>
      <Title>Active Learning Configuration</Title>
      
      <InfoBox style={{ marginBottom: '20px', background: '#e7f3ff', borderColor: '#b3d9ff', color: '#004085' }}>
        <strong>🔧 Configuration in Microservices Architecture</strong><br/>
        Configuration is now handled during experiment initialization. 
        The settings below show the current default configuration that will be used when initializing new experiments.
      </InfoBox>
      
      <ConfigSection>
        <SectionTitle>Model Update Strategy</SectionTitle>
        <FormGroup>
          <Label>Update Frequency</Label>
          <Select 
            value={updateStrategy} 
            onChange={(e) => setUpdateStrategy(e.target.value)}
            disabled
          >
            <option value="single">After Each Label (Single)</option>
            <option value="batch">After Batch of Labels</option>
          </Select>
        </FormGroup>
        
        {updateStrategy === 'batch' && (
          <FormGroup>
            <Label>Batch Size</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
              disabled
            />
          </FormGroup>
        )}
        
        <InfoBox>
          <strong>Current:</strong> Single update strategy (immediate retraining after each label)<br/>
          <strong>Note:</strong> Configuration is set during experiment initialization
        </InfoBox>
      </ConfigSection>

      <ConfigSection>
        <SectionTitle>Query Strategy</SectionTitle>
        <FormGroup>
          <Label>Selection Method</Label>
          <Select 
            value={queryMethod} 
            onChange={(e) => setQueryMethod(e.target.value)}
            disabled
          >
            <option value="uncertainty_sampling">Uncertainty Sampling</option>
            <option value="random_sampling">Random Sampling</option>
            <option value="margin_sampling">Margin Sampling</option>
          </Select>
        </FormGroup>
        
        <InfoBox>
          <strong>Current:</strong> Uncertainty Sampling (select samples with highest uncertainty)<br/>
          <strong>Note:</strong> Query strategy is configured during experiment setup
        </InfoBox>
      </ConfigSection>

      <InfoBox style={{ background: '#f8f9fa', borderColor: '#dee2e6', color: '#495057' }}>
        <strong>💡 How to Configure:</strong><br/>
        1. Reset the current experiment if needed<br/>
        2. Initialize a new experiment with your desired configuration<br/>
        3. The AL Engine will use your specified model, query strategy, and update frequency
      </InfoBox>
    </Container>
  );
}; 