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

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const VoteButton = styled.button<{ selected?: boolean }>`
  padding: 12px 24px;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  background-color: ${props => props.selected ? '#4CAF50' : 'white'};
  color: ${props => props.selected ? 'white' : '#4CAF50'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.selected ? '#45a049' : '#f0f8f0'};
  }

  &:disabled {
    border-color: #cccccc;
    background-color: ${props => props.selected ? '#cccccc' : '#f5f5f5'};
    color: #666666;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 16px;

  &:hover {
    background-color: #1976D2;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

interface VotingPanelProps {
  onVote: (label: number) => Promise<void>;
  disabled: boolean;
}

export const VotingPanel: React.FC<VotingPanelProps> = ({
  onVote,
  disabled
}) => {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = ['Class 0', 'Class 1', 'Class 2'];
  
  // Map string labels to numeric values
  const labelToNumber = (label: string): number => {
    switch (label) {
      case 'Class 0': return 0;
      case 'Class 1': return 1;
      case 'Class 2': return 2;
      default: return 0;
    }
  };

  const handleVote = async () => {
    if (!selectedLabel) return;

    setIsSubmitting(true);
    try {
      const numericLabel = labelToNumber(selectedLabel);
      await onVote(numericLabel);
      setSelectedLabel(null);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Title>Cast Your Vote</Title>
      <ButtonGroup>
        {labels.map(label => (
          <VoteButton
            key={label}
            selected={selectedLabel === label}
            disabled={disabled || isSubmitting}
            onClick={() => setSelectedLabel(label)}
          >
            {label.charAt(0).toUpperCase() + label.slice(1)}
          </VoteButton>
        ))}
      </ButtonGroup>
      <SubmitButton
        disabled={!selectedLabel || disabled || isSubmitting}
        onClick={handleVote}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
      </SubmitButton>
    </Container>
  );
}; 