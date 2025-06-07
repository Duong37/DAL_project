import React from 'react';
import styled from '@emotion/styled';
import { ModelMetrics as ModelMetricsType } from '../types/sample';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: #6c757d;
  font-size: 14px;
`;

const MetricValue = styled.span`
  font-weight: bold;
  color: #495057;
  font-size: 14px;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.percentage}%;
    height: 100%;
    background: linear-gradient(90deg, #28a745 0%, #34ce57 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
`;

const StatusBadge = styled.div<{ status: 'ready' | 'training' | 'error' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  
  ${props => {
    switch (props.status) {
      case 'ready':
        return `
          background: #d4edda;
          color: #155724;
        `;
      case 'training':
        return `
          background: #fff3cd;
          color: #856404;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background: #e2e3e5;
          color: #495057;
        `;
    }
  }}
`;

const LastUpdated = styled.div`
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  margin-top: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 16px;
  font-style: italic;
`;

interface ModelMetricsProps {
  metrics: ModelMetricsType | null;
}

export const ModelMetrics: React.FC<ModelMetricsProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <Container>
        <Title>Model Performance</Title>
        <EmptyState>No metrics available</EmptyState>
      </Container>
    );
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getProgressPercentage = (value: number | undefined) => {
    if (value === undefined) return 0;
    return value * 100;
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title>Model Performance</Title>
        <StatusBadge status="ready">Ready</StatusBadge>
      </div>

      <MetricItem>
        <MetricLabel>Accuracy</MetricLabel>
        <MetricValue>{formatPercentage(metrics.accuracy)}</MetricValue>
      </MetricItem>
      {metrics.accuracy !== undefined && (
        <ProgressBar percentage={getProgressPercentage(metrics.accuracy)} />
      )}

      <MetricItem>
        <MetricLabel>F1 Score</MetricLabel>
        <MetricValue>{formatPercentage(metrics.f1_score || metrics.f1Score)}</MetricValue>
      </MetricItem>
      {(metrics.f1_score || metrics.f1Score) !== undefined && (
        <ProgressBar percentage={getProgressPercentage(metrics.f1_score || metrics.f1Score)} />
      )}

      <MetricItem>
        <MetricLabel>Precision</MetricLabel>
        <MetricValue>{formatPercentage(metrics.precision)}</MetricValue>
      </MetricItem>

      <MetricItem>
        <MetricLabel>Recall</MetricLabel>
        <MetricValue>{formatPercentage(metrics.recall)}</MetricValue>
      </MetricItem>

      <MetricItem>
        <MetricLabel>Labeled Samples</MetricLabel>
        <MetricValue>
          {metrics.labeledCount || 0} / {metrics.totalSamples || 0}
        </MetricValue>
      </MetricItem>

      {metrics.lastUpdated && (
        <LastUpdated>
          Last updated: {metrics.lastUpdated}
        </LastUpdated>
      )}
      
      {metrics.model_info && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2e7d32', fontSize: '14px' }}>
            Model Configuration
          </div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            <div><strong>Library:</strong> {metrics.model_info.library}</div>
            <div><strong>Algorithm:</strong> {metrics.model_info.algorithm}</div>
            <div><strong>Parameters:</strong></div>
            <div style={{ marginLeft: '12px', marginTop: '4px' }}>
              {Object.entries(metrics.model_info.parameters).map(([key, value]) => (
                <div key={key}>
                  {key}: {value !== null ? String(value) : 'None'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {metrics.query_strategy && (
        <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#f57c00', fontSize: '14px' }}>
            Query Strategy
          </div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            <div><strong>Strategy:</strong> {metrics.query_strategy.name}</div>
            <div><strong>Method:</strong> {metrics.query_strategy.method}</div>
            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
              {metrics.query_strategy.description}
            </div>
          </div>
        </div>
      )}
      
      {metrics.update_config && (
        <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1976d2', fontSize: '14px' }}>
            Update Strategy
          </div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            <div><strong>Strategy:</strong> {metrics.update_config.strategy}</div>
            {metrics.update_config.strategy === 'batch' && (
              <div><strong>Batch Size:</strong> {metrics.update_config.batch_size}</div>
            )}
            <div><strong>Min Samples:</strong> {metrics.update_config.min_samples_for_update}</div>
          </div>
        </div>
      )}
    </Container>
  );
}; 