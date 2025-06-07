import React from 'react';
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

const SummaryPanel = styled.div`
  background: #e3f2fd;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bbdefb;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const UpdatesContainer = styled.div`
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`;

const UpdateItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UpdateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const UpdateId = styled.span`
  font-weight: bold;
  color: #1976d2;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 8px;
`;

const MetricItem = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const ImprovementIndicator = styled.span<{ improvement: number }>`
  font-size: 12px;
  color: ${props => props.improvement > 0 ? '#28a745' : props.improvement < 0 ? '#dc3545' : '#6c757d'};
  margin-left: 8px;
`;

const SimpleChart = styled.div`
  height: 100px;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 8px;
  position: relative;
  overflow: hidden;
`;

const ChartTitle = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  text-align: center;
`;

const ChartPoints = styled.div`
  display: flex;
  align-items: end;
  height: 60px;
  gap: 2px;
`;

const ChartBar = styled.div<{ height: number; color: string }>`
  flex: 1;
  background: ${props => props.color};
  height: ${props => props.height}%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  position: relative;
  
  &:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    white-space: nowrap;
    z-index: 1000;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 32px;
`;

interface ModelPerformanceHistoryProps {
  modelUpdates: {
    updates: any[];
    performance_trend: any[];
    summary: {
      total_updates: number;
      initial_accuracy: number;
      current_accuracy: number;
      total_improvement: number;
    };
  } | null;
}

export const ModelPerformanceHistory: React.FC<ModelPerformanceHistoryProps> = ({ modelUpdates }) => {
  if (!modelUpdates) {
    return (
      <Container>
        <Title>Model Performance History</Title>
        <EmptyState>Loading model history...</EmptyState>
      </Container>
    );
  }

  const { updates, performance_trend, summary } = modelUpdates;

  if (updates.length === 0) {
    return (
      <Container>
        <Title>Model Performance History</Title>
        <EmptyState>No model updates yet. Submit labels to start training!</EmptyState>
      </Container>
    );
  }

  // Prepare chart data
  const maxAccuracy = Math.max(...performance_trend.map(p => p.accuracy || 0));
  const minAccuracy = Math.min(...performance_trend.map(p => p.accuracy || 0));
  const accuracyRange = maxAccuracy - minAccuracy || 0.1;

  return (
    <Container>
      <Title>Model Performance History ({updates.length} updates)</Title>
      
      <SummaryPanel>
        <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>Performance Summary</h4>
        <SummaryItem>
          <span>Total Improvement:</span>
          <strong>
            {(summary.total_improvement * 100).toFixed(2)}%
            <ImprovementIndicator improvement={summary.total_improvement}>
              {summary.total_improvement > 0 ? '↗' : summary.total_improvement < 0 ? '↘' : '→'}
            </ImprovementIndicator>
          </strong>
        </SummaryItem>
        <SummaryItem>
          <span>Initial → Current Accuracy:</span>
          <strong>
            {(summary.initial_accuracy * 100).toFixed(1)}% → {(summary.current_accuracy * 100).toFixed(1)}%
          </strong>
        </SummaryItem>
        <SummaryItem>
          <span>Model Updates:</span>
          <strong>{summary.total_updates}</strong>
        </SummaryItem>
      </SummaryPanel>

      {performance_trend.length > 1 && (
        <SimpleChart>
          <ChartTitle>Accuracy Progression</ChartTitle>
          <ChartPoints>
            {performance_trend.map((point, index) => {
              const height = accuracyRange > 0 
                ? ((point.accuracy - minAccuracy) / accuracyRange) * 100 
                : 50;
              return (
                <ChartBar
                  key={index}
                  height={Math.max(height, 5)}
                  color={index === 0 ? '#dee2e6' : '#28a745'}
                  title={`Sample ${point.labeled_count}: ${(point.accuracy * 100).toFixed(1)}%`}
                />
              );
            })}
          </ChartPoints>
        </SimpleChart>
      )}

      <UpdatesContainer>
        {updates.slice().reverse().map((update, index) => (
          <UpdateItem key={update.update_id || index}>
            <UpdateHeader>
              <UpdateId>Update #{update.update_id}</UpdateId>
              <Timestamp>{update.timestamp}</Timestamp>
            </UpdateHeader>
            
            <div style={{ fontSize: '14px', color: '#495057', marginBottom: '8px' }}>
              Triggered by: <strong>{update.trigger_sample}</strong>
            </div>

            <MetricsGrid>
              <MetricItem>
                <MetricLabel>Accuracy</MetricLabel>
                <MetricValue>
                  {(update.new_metrics.accuracy * 100).toFixed(1)}%
                  <ImprovementIndicator improvement={update.performance_improvement.accuracy_change}>
                    {update.performance_improvement.accuracy_change > 0 ? 
                      `+${(update.performance_improvement.accuracy_change * 100).toFixed(2)}%` : 
                      `${(update.performance_improvement.accuracy_change * 100).toFixed(2)}%`
                    }
                  </ImprovementIndicator>
                </MetricValue>
              </MetricItem>
              
              <MetricItem>
                <MetricLabel>F1 Score</MetricLabel>
                <MetricValue>
                  {(update.new_metrics.f1_score * 100).toFixed(1)}%
                  <ImprovementIndicator improvement={update.performance_improvement.f1_change}>
                    {update.performance_improvement.f1_change > 0 ? 
                      `+${(update.performance_improvement.f1_change * 100).toFixed(2)}%` : 
                      `${(update.performance_improvement.f1_change * 100).toFixed(2)}%`
                    }
                  </ImprovementIndicator>
                </MetricValue>
              </MetricItem>
              
              <MetricItem>
                <MetricLabel>Precision</MetricLabel>
                <MetricValue>{(update.new_metrics.precision * 100).toFixed(1)}%</MetricValue>
              </MetricItem>
              
              <MetricItem>
                <MetricLabel>Recall</MetricLabel>
                <MetricValue>{(update.new_metrics.recall * 100).toFixed(1)}%</MetricValue>
              </MetricItem>
              
              <MetricItem>
                <MetricLabel>Labeled Samples</MetricLabel>
                <MetricValue>{update.total_labeled}</MetricValue>
              </MetricItem>
            </MetricsGrid>
          </UpdateItem>
        ))}
      </UpdatesContainer>
    </Container>
  );
}; 