import React from 'react';
import styled from '@emotion/styled';
import { Sample } from '../types/sample';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
`;

const SampleContent = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  min-height: 100px;
`;

const NoSample = styled.div`
  text-align: center;
  color: #666;
  padding: 32px;
`;

interface SampleDisplayProps {
  sample: Sample | null;
}

export const SampleDisplay: React.FC<SampleDisplayProps> = ({ sample }) => {
  if (!sample) {
    return (
      <Container>
        <Title>Current Sample</Title>
        <NoSample>
          No sample available for labeling at this time.
        </NoSample>
      </Container>
    );
  }

  const renderContent = () => {
    // Handle wine dataset with feature names
    if (sample.data && sample.features) {
      return (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2196F3' }}>
              Wine Sample Analysis
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
              Chemical analysis showing {Object.keys(sample.features).length} features
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '16px' }}>
            {Object.entries(sample.features).map(([name, value]) => (
              <div key={name} style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#666', textTransform: 'capitalize' }}>
                  {name.replace(/_/g, ' ')}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {typeof value === 'number' ? value.toFixed(3) : value}
                </div>
              </div>
            ))}
          </div>
          
          {sample.metadata && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1976d2' }}>
                Model Prediction
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: '#666' }}>Predicted: </span>
                  <span style={{ fontWeight: 'bold' }}>{sample.metadata.predicted_class}</span>
                </div>
                <div>
                  <span style={{ color: '#666' }}>Confidence: </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {(sample.metadata.prediction_confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {sample.metadata && sample.metadata.class_probabilities && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Class Probabilities:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                    {Object.entries(sample.metadata.class_probabilities).map(([className, prob]) => (
                      <div key={className} style={{ 
                        padding: '2px 6px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '3px',
                        border: className === `class_${sample.metadata!.predicted_class.split('_')[1]}` ? '2px solid #1976d2' : '1px solid #dee2e6'
                      }}>
                        {className.replace('class_', 'C')}: {(Number(prob) * 100).toFixed(1)}%
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {sample.uncertainty && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#f57c00' }}>
                Uncertainty Score: {sample.uncertainty.toFixed(3)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Higher uncertainty = more valuable for model improvement
              </div>
              {sample.metadata?.query_strategy && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#555' }}>
                  <strong>Strategy:</strong> {sample.metadata.query_strategy.name} ({sample.metadata.query_strategy.method})
                </div>
              )}
            </div>
          )}
          
          {sample.metadata?.model_info && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#2e7d32' }}>
                Model Information
              </div>
              <div style={{ fontSize: '12px', color: '#555' }}>
                <div><strong>Type:</strong> {sample.metadata.model_info.type}</div>
                <div><strong>Training Samples:</strong> {sample.metadata.model_info.training_samples}</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle new data array format (fallback)
    if (sample.data) {
      return (
        <div>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Data Array:</div>
          <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(sample.data, null, 2)}
          </pre>
          {sample.uncertainty && (
            <div style={{ marginTop: '8px', color: '#666' }}>
              Uncertainty: {sample.uncertainty.toFixed(3)}
            </div>
          )}
        </div>
      );
    }

    // Handle old content format
    if (!sample.content) {
      return <div>No content available</div>;
    }

    switch (sample.type) {
      case 'text':
        return <div>{sample.content}</div>;
      case 'image':
        return (
          <img 
            src={sample.content} 
            alt={`Sample ${sample.id}`}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        );
      case 'data':
        try {
          const data = JSON.parse(sample.content);
          return <pre>{JSON.stringify(data, null, 2)}</pre>;
        } catch {
          return <pre>{sample.content}</pre>;
        }
      default:
        return <div>{sample.content}</div>;
    }
  };

  return (
    <Container>
      <Title>Sample #{sample.id}</Title>
      <SampleContent>
        {renderContent()}
      </SampleContent>
    </Container>
  );
}; 