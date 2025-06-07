import React from 'react';
import styled from '@emotion/styled';
import { VoteStatusType as StatusType } from '../types/sample';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  color: #333;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatusCard = styled.div`
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

const Progress = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
`;

const SimpleStatus = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  color: #333;
`;

interface VoteStatusProps {
  status: StatusType | null;
}

export const VoteStatus: React.FC<VoteStatusProps> = ({ status }) => {
  if (!status) {
    return null;
  }

  // Handle simple string status
  if (typeof status === 'string') {
    const statusMessages = {
      'idle': 'Ready to vote',
      'voting': 'Submitting vote...',
      'submitted': 'Vote submitted successfully!'
    };

    return (
      <Container>
        <Title>Vote Status</Title>
        <SimpleStatus>
          {statusMessages[status] || status}
        </SimpleStatus>
      </Container>
    );
  }

  // Handle detailed VoteStatus object
  const progress = (status.currentVotes / status.totalVotes) * 100;

  return (
    <Container>
      <Title>Voting Progress</Title>
      <StatusGrid>
        <StatusCard>
          <Label>Current Votes</Label>
          <Value>{status.currentVotes}</Value>
        </StatusCard>
        <StatusCard>
          <Label>Required Votes</Label>
          <Value>{status.totalVotes}</Value>
        </StatusCard>
        <StatusCard>
          <Label>Progress</Label>
          <Value>{Math.round(progress)}%</Value>
          <Progress>
            <ProgressBar width={progress} />
          </Progress>
        </StatusCard>
      </StatusGrid>

      {status.isFinalized && status.winningLabel && (
        <StatusCard>
          <Label>Final Decision</Label>
          <Value style={{ color: '#4CAF50' }}>
            {status.winningLabel.charAt(0).toUpperCase() + status.winningLabel.slice(1)}
          </Value>
        </StatusCard>
      )}
    </Container>
  );
}; 