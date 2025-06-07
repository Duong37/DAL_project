import React from 'react';
import styled from '@emotion/styled';
import { ModelMetrics } from '../types/sample';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div<{ isTraining: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.isTraining ? '#FFA726' : '#4CAF50'};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
`;

const MetricCard = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  text-align: center;
`;

const Label = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const Value = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

interface ModelInfoProps {
  metrics: ModelMetrics | null;
  isTraining: boolean;
}

export const ModelInfo: React.FC<ModelInfoProps> = ({ metrics, isTraining }) => {
  if (!metrics) {
    return null;
  }

  const formatPercent = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container>
      <Title>
        <StatusIndicator isTraining={isTraining} />
        Model Status {isTraining && '(Training...)'}
      </Title>
      
      <MetricsGrid>
        <MetricCard>
          <Label>Accuracy</Label>
          <Value>{formatPercent(metrics.accuracy)}</Value>
        </MetricCard>
        <MetricCard>
          <Label>F1 Score</Label>
          <Value>{formatPercent(metrics.f1Score || metrics.f1_score)}</Value>
        </MetricCard>
        <MetricCard>
          <Label>Labeled Samples</Label>
          <Value>{metrics.labeledCount || 0}</Value>
        </MetricCard>
        <MetricCard>
          <Label>Total Samples</Label>
          <Value>{metrics.totalSamples || 0}</Value>
        </MetricCard>
      </MetricsGrid>

      <div style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
        Last updated: {formatDate(metrics.lastUpdated)}
      </div>
      
      {isTraining && (
        <div style={{ textAlign: 'center', marginTop: '8px', color: '#4CAF50' }}>
          Training in progress...
        </div>
      )}
    </Container>
  );
}; 