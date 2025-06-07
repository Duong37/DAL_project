import { useState, useCallback } from 'react';
import { Sample } from '../types/sample';
import { DALAPIClient } from '../services/api';

export const useVoting = () => {
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [voteStatus, setVoteStatus] = useState<'idle' | 'voting' | 'submitted'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVoteResult, setLastVoteResult] = useState<any>(null);

  const vote = useCallback(async (label: number, confidence: number = 1.0) => {
    if (!currentSample) {
      throw new Error('No sample available for voting');
    }

    setVoteStatus('voting');
    try {
      const result = await DALAPIClient.submitLabel(currentSample.id, label, { confidence });
      setVoteStatus('submitted');
      return result;
    } catch (error) {
      console.error('Error submitting vote:', error);
      setVoteStatus('idle');
      throw error;
    }
  }, [currentSample]);

  const startVotingSession = useCallback(async (samples: Sample[]) => {
    try {
      // In the new architecture, voting sessions are handled automatically
      // when labels are submitted, so we just return a success response
      return {
        status: 'success',
        session_id: `session_${Date.now()}`,
        message: 'Voting session started'
      };
    } catch (error) {
      console.error('Error starting voting session:', error);
      throw error;
    }
  }, []);

  const getVotingResults = useCallback(async (sessionId: string) => {
    try {
      // In the new architecture, we get metrics instead of voting results
      const result = await DALAPIClient.getMetrics();
      return result;
    } catch (error) {
      console.error('Error getting voting results:', error);
      throw error;
    }
  }, []);

  const setSampleForVoting = useCallback((sample: Sample) => {
    setCurrentSample(sample);
    setVoteStatus('idle');
  }, []);

  const submitVote = useCallback(async (sampleId: string, label: number) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await DALAPIClient.submitLabel(sampleId, label, { timestamp: Date.now() });
      setLastVoteResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit vote';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    currentSample,
    voteStatus,
    vote,
    startVotingSession,
    getVotingResults,
    setSampleForVoting,
    submitVote,
    isSubmitting,
    error,
    lastVoteResult
  };
}; 