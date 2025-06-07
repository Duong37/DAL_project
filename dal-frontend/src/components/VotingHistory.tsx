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

const AnalyticsPanel = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const AnalyticItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HistoryContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`;

const VoteItem = styled.div<{ correct: boolean }>`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  background: ${props => props.correct ? '#d4edda' : '#f8d7da'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const VoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SampleId = styled.span`
  font-weight: bold;
  color: #495057;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const VoteDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 8px;
  font-size: 14px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.span`
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
`;

const DetailValue = styled.span`
  font-weight: bold;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 32px;
`;

interface VotingHistoryProps {
  votingHistory: {
    votes: any[];
    analytics: {
      total_votes: number;
      correct_votes: number;
      accuracy_rate: number;
      average_uncertainty: number;
      class_distribution: Record<string, number>;
    };
  } | null;
}

export const VotingHistory: React.FC<VotingHistoryProps> = ({ votingHistory }) => {
  if (!votingHistory) {
    return (
      <Container>
        <Title>Voting History</Title>
        <EmptyState>Loading voting history...</EmptyState>
      </Container>
    );
  }

  const { votes, analytics } = votingHistory;

  if (votes.length === 0) {
    return (
      <Container>
        <Title>Voting History</Title>
        <EmptyState>No votes recorded yet. Start labeling samples to see your history!</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Voting History ({votes.length} votes)</Title>
      
      <AnalyticsPanel>
        <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>Analytics Summary</h4>
        <AnalyticItem>
          <span>Human Labeling Accuracy:</span>
          <strong>{analytics.accuracy_rate.toFixed(1)}%</strong>
        </AnalyticItem>
        <AnalyticItem>
          <span>Correct Labels:</span>
          <strong>{analytics.correct_votes} / {analytics.total_votes}</strong>
        </AnalyticItem>
        <AnalyticItem>
          <span>Average Uncertainty:</span>
          <strong>{analytics.average_uncertainty.toFixed(3)}</strong>
        </AnalyticItem>
        <AnalyticItem>
          <span>Class Distribution:</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {Object.entries(analytics.class_distribution).map(([className, count]) => (
              <span key={className}>
                {className.replace('class_', 'C')}: {count}
              </span>
            ))}
          </div>
        </AnalyticItem>
      </AnalyticsPanel>

      <HistoryContainer>
        {votes.slice().reverse().map((vote, index) => (
          <VoteItem key={vote.sample_id || index} correct={vote.correct}>
            <VoteHeader>
              <SampleId>{vote.sample_id}</SampleId>
              <Timestamp>{vote.timestamp}</Timestamp>
            </VoteHeader>
            
            <VoteDetails>
              <DetailItem>
                <DetailLabel>Your Label</DetailLabel>
                <DetailValue>Class {vote.user_label}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>True Label</DetailLabel>
                <DetailValue>Class {vote.true_label}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Model Predicted</DetailLabel>
                <DetailValue>{vote.model_prediction_before}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Confidence</DetailLabel>
                <DetailValue>{(vote.confidence_before * 100).toFixed(1)}%</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Uncertainty</DetailLabel>
                <DetailValue>{vote.uncertainty_score.toFixed(3)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Result</DetailLabel>
                <DetailValue style={{ color: vote.correct ? '#155724' : '#721c24' }}>
                  {vote.correct ? '✓ Correct' : '✗ Incorrect'}
                </DetailValue>
              </DetailItem>
            </VoteDetails>
          </VoteItem>
        ))}
      </HistoryContainer>
    </Container>
  );
}; 