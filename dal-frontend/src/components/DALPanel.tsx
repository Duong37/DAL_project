import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { SampleDisplay } from './SampleDisplay';
import { VotingPanel } from './VotingPanel';
import { VotingHistory } from './VotingHistory';
import { ModelPerformanceHistory } from './ModelPerformanceHistory';
import { BlockchainSimulation } from './BlockchainSimulation';
import { ConfigurationPanel } from './ConfigurationPanel';
import { WalletConnect } from './WalletConnect';
import { useActiveLeaning } from '../hooks/useActiveLeaning';
import { useVoting } from '../hooks/useVoting';
import { useWallet } from '../hooks/useWallet';
import { DALAPIClient } from '../services/api';

const PanelContainer = styled.div`
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const Title = styled.h1`
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.h2`
  color: #4a5568;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 400;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#3182ce' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: none;
  padding: 0.75rem 1rem;
  margin-right: 0.5rem;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#2c5aa0' : '#f7fafc'};
  }
`;

const TabContent = styled.div`
  flex: 1;
  padding: 1rem 0;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ActiveLearningTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InitializationPanel = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
`;

const InitializationTitle = styled.h2`
  color: #0c4a6e;
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
  font-weight: 700;
`;

const InitializationDescription = styled.p`
  color: #075985;
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const InitializationActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const InitializeButton = styled.button`
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(14, 165, 233, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(14, 165, 233, 0.4);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-weight: 500;
`;

const StatusIndicator = styled.div<{ status: 'loading' | 'ready' | 'error' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  
  ${props => props.status === 'loading' && `
    background: #fef3c7;
    color: #d97706;
    border: 1px solid #fcd34d;
  `}
  
  ${props => props.status === 'ready' && `
    background: #d1fae5;
    color: #065f46;
    border: 1px solid #86efac;
  `}
  
  ${props => props.status === 'error' && `
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  `}
`;

const ResetSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border: 2px solid #fc8181;
  border-radius: 12px;
  position: relative;
`;

const QuitSessionSection = styled.div`
  margin-top: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
  border: 2px solid #a855f7;
  border-radius: 12px;
`;

const DisconnectWalletSection = styled.div`
  margin-top: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'warning' | 'primary' }>`
  background: ${props => {
    switch(props.variant) {
      case 'danger': return 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'primary': return 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0.25rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ResetTitle = styled.h3`
  color: #c53030;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const GuideButton = styled.button`
  background: #3182ce;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2c5aa0;
    transform: scale(1.1);
  }
`;

const ResetButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ResetButton = styled.button`
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(197, 48, 48, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #c53030 0%, #9c2626 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(197, 48, 48, 0.4);
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CollaborativeNote = styled.div`
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #744210;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Modal components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  color: #2d3748;
  margin: 0;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  
  &:hover {
    color: #4a5568;
  }
`;

const ResetStepsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;
`;

const ResetStep = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #e53e3e;
`;

const StepIcon = styled.span`
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 2px;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-size: 1rem;
`;

const StepDescription = styled.p`
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const WarningBox = styled.div`
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
  border: 2px solid #f6ad55;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
`;

const WarningTitle = styled.h3`
  color: #c05621;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const ModalButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.variant === 'primary' && `
    background: #3182ce;
    color: white;
    &:hover { background: #2c5aa0; }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: #e2e8f0;
    color: #4a5568;
    &:hover { background: #cbd5e0; }
  `}
  
  ${props => props.variant === 'danger' && `
    background: #e53e3e;
    color: white;
    &:hover { background: #c53030; }
  `}
`;

const CollaborativeSection = styled.div`
  background: #edf2f7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
`;

type TabType = 'active-learning' | 'voting-history' | 'model-performance' | 'blockchain-simulation' | 'configuration';

export const DALPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active-learning');
  const [initializationStatus, setInitializationStatus] = useState<'checking' | 'not_initialized' | 'initialized' | 'initializing'>('checking');
  const [initError, setInitError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showInitializeConfirmation, setShowInitializeConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasVotingStarted, setHasVotingStarted] = useState(false);
  const [showQuitSessionConfirmation, setShowQuitSessionConfirmation] = useState(false);
  const [showDisconnectWalletConfirmation, setShowDisconnectWalletConfirmation] = useState(false);
  const [isQuittingSession, setIsQuittingSession] = useState(false);
  
  const {
    currentSample,
    votingHistory,
    modelUpdates,
    blockchainData,
    refreshAll
  } = useActiveLeaning();

  const { submitVote } = useVoting();
  const { account, connect, disconnect } = useWallet();

  // Check initialization status and voting history on component mount
  useEffect(() => {
    if (account) {
      checkInitializationStatus();
      checkVotingHistory();
    }
  }, [account]);

  const checkInitializationStatus = async () => {
    try {
      const response = await DALAPIClient.getSystemStatus();
      if (response.status === 'success') {
        const hasActiveExperiment = response.services?.orchestrator?.active_experiments > 0;
        setInitializationStatus(hasActiveExperiment ? 'initialized' : 'not_initialized');
      } else {
        setInitializationStatus('not_initialized');
      }
    } catch (error) {
      console.error('Failed to check initialization status:', error);
      setInitializationStatus('not_initialized');
    }
  };

  const checkVotingHistory = async () => {
    try {
      // For now, we'll assume voting has started if we have an active experiment
      const experimentId = DALAPIClient.getCurrentExperimentId();
      setHasVotingStarted(!!experimentId);
    } catch (error) {
      console.error('Failed to check voting history:', error);
    }
  };

  const handleVote = async (label: number) => {
    if (!currentSample || initializationStatus !== 'initialized' || !account) return;

    try {
      await submitVote(currentSample.id, label);
      await refreshAll();
      setHasVotingStarted(true);
    } catch (error) {
      console.error('Vote submission failed:', error);
    }
  };

  const handleShowGuide = () => {
    setShowGuide(true);
  };

  const handleShowResetConfirmation = () => {
    setShowGuide(false);
    setShowResetConfirmation(true);
  };

  const handleShowInitializeConfirmation = () => {
    setShowInitializeConfirmation(true);
  };

  const handleReset = async () => {
    setIsResetting(true);
    setShowResetConfirmation(false);
    
    try {
      const response = await DALAPIClient.resetSystem();
      
      if (response.status === 'success') {
        setInitializationStatus('not_initialized');
        setHasVotingStarted(false);
        await refreshAll();
      } else {
        setInitError(response.error || 'Reset failed');
      }
    } catch (error) {
      setInitError('Failed to reset model');
      console.error('Reset failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleInitialize = async () => {
    setShowInitializeConfirmation(false);
    setIsInitializing(true);
    setInitializationStatus('initializing');
    setInitError(null);
    
    try {
      const response = await DALAPIClient.initializeExperiment();
      
      if (response.status === 'success') {
        setInitializationStatus('initialized');
        await refreshAll();
      } else {
        setInitError(response.error || 'Initialization failed');
        setInitializationStatus('not_initialized');
      }
    } catch (error) {
      setInitError('Failed to initialize model');
      setInitializationStatus('not_initialized');
      console.error('Initialization failed:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleQuitSession = async () => {
    setIsQuittingSession(true);
    try {
      // In a real implementation, this would notify the backend that the user is leaving
      // but wants to remain as a participant in the session
      console.log('Quitting session but remaining as participant');
      
      // Reset local state by refreshing all data which will clear current state
      await refreshAll();
      setInitializationStatus('not_initialized');
      setActiveTab('active-learning');
      setShowQuitSessionConfirmation(false);
      
      // Show success message
      alert('Session quit successfully. You remain a participant in the experiment.');
    } catch (error) {
      console.error('Failed to quit session:', error);
      alert('Failed to quit session. Please try again.');
    } finally {
      setIsQuittingSession(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      // Disconnect wallet and clear all session data
      disconnect();
      
      // Reset all local state
      setInitializationStatus('not_initialized');
      setActiveTab('active-learning');
      setShowDisconnectWalletConfirmation(false);
      
      console.log('Wallet disconnected and session cleared');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      alert('Failed to disconnect wallet. Please try again.');
    }
  };

  const renderWalletConnection = () => (
    <InitializationPanel>
      <InitializationTitle>Wallet Connection Required</InitializationTitle>
      <InitializationDescription>
        Welcome to the Decentralized Active Learning System!<br/>
        Please connect your wallet to participate in collaborative machine learning.<br/>
        Your wallet address will be used for authentication and voting verification.
      </InitializationDescription>
      
      <InitializationActions>
        <WalletConnect 
          account={account}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </InitializationActions>
    </InitializationPanel>
  );

  const renderModelManagement = () => (
    <ResetSection>
      <ResetHeader>
        <ResetTitle>Model Management</ResetTitle>
        <GuideButton onClick={handleShowGuide} title="Learn about reset and initialize processes">
          ?
        </GuideButton>
      </ResetHeader>
      
      <ResetButtonContainer>
        <ResetButton 
          onClick={handleShowResetConfirmation}
          disabled={isResetting || !hasVotingStarted}
          style={{ 
            background: !hasVotingStarted ? '#94a3b8' : undefined,
            cursor: !hasVotingStarted ? 'not-allowed' : undefined
          }}
        >
          {isResetting ? 'Resetting...' : 'Reset Model'}
        </ResetButton>
        
        <InitializeButton 
          onClick={handleShowInitializeConfirmation}
          disabled={isInitializing || initializationStatus === 'initialized' || hasVotingStarted}
          style={{ 
            background: (initializationStatus === 'initialized' || hasVotingStarted) ? '#94a3b8' : undefined,
            cursor: (initializationStatus === 'initialized' || hasVotingStarted) ? 'not-allowed' : undefined
          }}
        >
          {isInitializing ? 'Initializing...' : 'Initialize Model'}
        </InitializeButton>
      </ResetButtonContainer>
      
      <CollaborativeNote>
        <span>Collaborative Environment:</span>
        <span>
          Reset is only available after voting has started. 
          Initialize is only available when the model is not initialized and no voting has occurred.
        </span>
      </CollaborativeNote>
    </ResetSection>
  );

  const renderSessionManagement = () => (
    <>
      <QuitSessionSection>
        <ResetHeader>
          <ResetTitle>Session Management</ResetTitle>
        </ResetHeader>
        <p style={{ margin: '0 0 1rem 0', color: '#6b46c1', fontSize: '0.9rem' }}>
          Quit the current session while remaining as a participant in the experiment.
        </p>
        <ActionButton 
          variant="primary"
          onClick={() => setShowQuitSessionConfirmation(true)}
          disabled={isQuittingSession}
        >
          {isQuittingSession ? 'Quitting Session...' : 'Quit Session'}
        </ActionButton>
      </QuitSessionSection>

      <DisconnectWalletSection>
        <ResetHeader>
          <ResetTitle>Wallet Management</ResetTitle>
        </ResetHeader>
        <p style={{ margin: '0 0 1rem 0', color: '#d97706', fontSize: '0.9rem' }}>
          Disconnect your wallet and completely log out of the session.
        </p>
        <ActionButton 
          variant="warning"
          onClick={() => setShowDisconnectWalletConfirmation(true)}
        >
          Disconnect Wallet
        </ActionButton>
      </DisconnectWalletSection>
    </>
  );

  const renderGuideModal = () => {
    if (!showGuide) return null;
    
    return (
      <ModalOverlay onClick={() => setShowGuide(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <CloseButton onClick={() => setShowGuide(false)}>×</CloseButton>
          
          <ModalHeader>
            <ModalTitle>Model Management Guide</ModalTitle>
          </ModalHeader>
          
          <div>
            <p>
              The interface provides two separate operations for managing your active learning experiment with smart state management:
            </p>
            
            <ResetStepsList>
              <ResetStep>
                <StepIcon>Reset</StepIcon>
                <StepContent>
                  <StepTitle>Reset Model</StepTitle>
                  <StepDescription>
                    Clears all voting history, model updates, performance tracking, and model state. 
                    Only available after voting has started to prevent accidental resets.
                  </StepDescription>
                </StepContent>
              </ResetStep>
              
              <ResetStep>
                <StepIcon>Init</StepIcon>
                <StepContent>
                  <StepTitle>Initialize Model</StepTitle>
                  <StepDescription>
                    Performs warm start training on the original Wine dataset (178 samples) and 
                    generates 100 synthetic samples for active learning. Only available when model is not initialized and no voting has occurred.
                  </StepDescription>
                </StepContent>
              </ResetStep>
            </ResetStepsList>
            
            <WarningBox>
              <WarningTitle>
                Smart State Management
              </WarningTitle>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li><strong>Reset Button:</strong> Disabled (grey) until voting starts to prevent accidental data loss</li>
                <li><strong>Initialize Button:</strong> Disabled (grey) once model is initialized or voting has started</li>
                <li>This prevents common mistakes like resetting before any work is done</li>
                <li>Ensures proper workflow: Connect Wallet → Initialize → Vote → Reset (if needed)</li>
              </ul>
            </WarningBox>
            
            <CollaborativeSection>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>Collaborative Workflow</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568' }}>
                In a production environment with multiple researchers, these actions should be:
              </p>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#4a5568' }}>
                <li>Proposed by one team member via smart contract</li>
                <li>Voted on by all collaborators through blockchain consensus</li>
                <li>Executed only with majority approval and proper authorization</li>
                <li>Logged with timestamp, reason, and voting results for audit trails</li>
              </ul>
            </CollaborativeSection>
          </div>
          
          <ModalButtons>
            <ModalButton variant="secondary" onClick={() => setShowGuide(false)}>
              Close Guide
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const renderResetConfirmationModal = () => {
    if (!showResetConfirmation) return null;
    
    return (
      <ModalOverlay onClick={() => setShowResetConfirmation(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <CloseButton onClick={() => setShowResetConfirmation(false)}>×</CloseButton>
          
          <ModalHeader>
            <ModalTitle>Confirm Model Reset</ModalTitle>
          </ModalHeader>
          
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Are you sure you want to reset the active learning model?
            </p>
            
            <WarningBox>
              <WarningTitle>
                This Will Permanently Delete:
              </WarningTitle>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li><strong>All voting history</strong> and user label submissions</li>
                <li><strong>Model performance tracking</strong> and improvement metrics</li>
                <li><strong>Blockchain simulation data</strong> (on-chain and off-chain records)</li>
                <li><strong>Current model state</strong> and training progress</li>
              </ul>
            </WarningBox>
            
            <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '6px', padding: '1rem', margin: '1rem 0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#c53030' }}>Important:</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#744210' }}>
                After reset, the model will be <strong>uninitialized</strong>. You will need to run 
                <strong> Initialize Model</strong> separately to train the model and generate synthetic data.
              </p>
            </div>
            
            <CollaborativeNote>
              <span>Team Notice:</span>
              <span>
                In collaborative environments, consider getting team 
                approval before resetting shared experimental data.
              </span>
            </CollaborativeNote>
          </div>
          
          <ModalButtons>
            <ModalButton variant="secondary" onClick={() => setShowResetConfirmation(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="danger" onClick={handleReset}>
              Yes, Reset Model
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const renderInitializeConfirmationModal = () => {
    if (!showInitializeConfirmation) return null;
    
    return (
      <ModalOverlay onClick={() => setShowInitializeConfirmation(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <CloseButton onClick={() => setShowInitializeConfirmation(false)}>×</CloseButton>
          
          <ModalHeader>
            <ModalTitle>Confirm Model Initialization</ModalTitle>
          </ModalHeader>
          
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Initialize the active learning model with warm start training?
            </p>
            
            <div style={{ background: '#e6fffa', border: '1px solid #38b2ac', borderRadius: '6px', padding: '1rem', margin: '1rem 0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#234e52' }}>This Will Create:</h4>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                <li>Model trained on original Wine dataset (178 samples)</li>
                <li>100 new synthetic wine samples for active learning</li>
                <li>Clean analytics dashboards ready for experiments</li>
                <li>Baseline performance metrics</li>
              </ul>
            </div>
            
            <WarningBox>
              <WarningTitle>
                Prerequisites
              </WarningTitle>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                The system must be in an uninitialized state. If already initialized, 
                please reset first before running initialization.
              </p>
            </WarningBox>
            
            <CollaborativeNote>
              <span>Team Notice:</span>
              <span>
                This will establish the baseline model that all 
                team members will collaborate on for active learning.
              </span>
            </CollaborativeNote>
          </div>
          
          <ModalButtons>
            <ModalButton variant="secondary" onClick={() => setShowInitializeConfirmation(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={handleInitialize}>
              Yes, Initialize Model
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const renderQuitSessionConfirmationModal = () => {
    if (!showQuitSessionConfirmation) return null;
    
    return (
      <ModalOverlay onClick={() => setShowQuitSessionConfirmation(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <CloseButton onClick={() => setShowQuitSessionConfirmation(false)}>×</CloseButton>
          
          <ModalHeader>
            <ModalTitle>Confirm Quit Session</ModalTitle>
          </ModalHeader>
          
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Are you sure you want to quit the current session?
            </p>
            
            <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px', padding: '1rem', margin: '1rem 0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>What happens when you quit:</h4>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                <li>Your local session data will be cleared</li>
                <li>You will remain a participant in the experiment</li>
                <li>Your wallet stays connected</li>
                <li>You can rejoin the session anytime</li>
                <li>Your previous contributions are preserved</li>
              </ul>
            </div>
            
            <CollaborativeNote>
              <span>Note:</span>
              <span>
                This is different from disconnecting your wallet - you'll still be logged in 
                and can quickly rejoin the experiment.
              </span>
            </CollaborativeNote>
          </div>
          
          <ModalButtons>
            <ModalButton variant="secondary" onClick={() => setShowQuitSessionConfirmation(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" onClick={handleQuitSession}>
              Yes, Quit Session
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const renderDisconnectWalletConfirmationModal = () => {
    if (!showDisconnectWalletConfirmation) return null;
    
    return (
      <ModalOverlay onClick={() => setShowDisconnectWalletConfirmation(false)}>
        <ModalContent onClick={e => e.stopPropagation()}>
          <CloseButton onClick={() => setShowDisconnectWalletConfirmation(false)}>×</CloseButton>
          
          <ModalHeader>
            <ModalTitle>Confirm Disconnect Wallet</ModalTitle>
          </ModalHeader>
          
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Are you sure you want to disconnect your wallet?
            </p>
            
            <WarningBox>
              <WarningTitle>
                This Will:
              </WarningTitle>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li><strong>Completely log you out</strong> of the session</li>
                <li><strong>Clear all local data</strong> and session state</li>
                <li><strong>Require wallet reconnection</strong> to rejoin</li>
                <li><strong>End your current session</strong> participation</li>
              </ul>
            </WarningBox>
            
            <div style={{ background: '#e6fffa', border: '1px solid #38b2ac', borderRadius: '6px', padding: '1rem', margin: '1rem 0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#234e52' }}>Your contributions remain safe:</h4>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                All your previous votes and model contributions are permanently stored 
                on the blockchain and will not be lost.
              </p>
            </div>
          </div>
          
          <ModalButtons>
            <ModalButton variant="secondary" onClick={() => setShowDisconnectWalletConfirmation(false)}>
              Cancel
            </ModalButton>
            <ModalButton variant="danger" onClick={handleDisconnectWallet}>
              Yes, Disconnect Wallet
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );
  };

  const renderInitializationPanel = () => {
    if (!account) {
      return null; // Wallet connection panel will be shown instead
    }

    if (initializationStatus === 'checking') {
      return (
        <InitializationPanel>
          <StatusIndicator status="loading">Checking initialization status...</StatusIndicator>
        </InitializationPanel>
      );
    }

    if (initializationStatus === 'initializing') {
      return (
        <InitializationPanel>
          <StatusIndicator status="loading">Initializing model and generating synthetic data...</StatusIndicator>
        </InitializationPanel>
      );
    }

    // Show main interface directly - no research setup page
    return (
      <MainContainer>
        <TabContainer>
          <TabButton 
            active={activeTab === 'active-learning'} 
            onClick={() => setActiveTab('active-learning')}
          >
            Active Learning
          </TabButton>
          <TabButton 
            active={activeTab === 'voting-history'} 
            onClick={() => setActiveTab('voting-history')}
          >
            Voting History
          </TabButton>
          <TabButton 
            active={activeTab === 'model-performance'} 
            onClick={() => setActiveTab('model-performance')}
          >
            Model Performance
          </TabButton>
          <TabButton 
            active={activeTab === 'blockchain-simulation'} 
            onClick={() => setActiveTab('blockchain-simulation')}
          >
            Blockchain Simulation
          </TabButton>
          <TabButton 
            active={activeTab === 'configuration'} 
            onClick={() => setActiveTab('configuration')}
          >
            Configuration
          </TabButton>
        </TabContainer>

        <TabContent>
          {activeTab === 'active-learning' && (
            <ActiveLearningTab>
              <ContentSection>
                <SectionTitle>Active Learning Interface</SectionTitle>
                {initializationStatus === 'not_initialized' ? (
                  <StatusIndicator status="error">
                    Model not initialized. Please initialize the model first using the Model Management section below.
                  </StatusIndicator>
                ) : (
                  <>
                    <SampleDisplay sample={currentSample} />
                    <VotingPanel onVote={handleVote} disabled={!currentSample || initializationStatus !== 'initialized'} />
                  </>
                )}
                
                {initError && (
                  <ErrorMessage>{initError}</ErrorMessage>
                )}
              </ContentSection>
              {renderModelManagement()}
              {renderSessionManagement()}
            </ActiveLearningTab>
          )}
          
          {activeTab === 'voting-history' && (
            <ContentSection>
              <SectionTitle>Voting History & Analytics</SectionTitle>
              <VotingHistory votingHistory={votingHistory} />
            </ContentSection>
          )}
          
          {activeTab === 'model-performance' && (
            <ContentSection>
              <SectionTitle>Model Performance Tracking</SectionTitle>
              <ModelPerformanceHistory modelUpdates={modelUpdates} />
            </ContentSection>
          )}
          
          {activeTab === 'blockchain-simulation' && (
            <ContentSection>
              <SectionTitle>Blockchain Privacy Simulation</SectionTitle>
              <BlockchainSimulation blockchainData={blockchainData} />
            </ContentSection>
          )}
          
          {activeTab === 'configuration' && (
            <ContentSection>
              <SectionTitle>System Configuration</SectionTitle>
              <ConfigurationPanel />
            </ContentSection>
          )}
        </TabContent>
        
        {renderGuideModal()}
        {renderResetConfirmationModal()}
        {renderInitializeConfirmationModal()}
        {renderQuitSessionConfirmationModal()}
        {renderDisconnectWalletConfirmationModal()}
      </MainContainer>
    );
  };

  return (
    <PanelContainer>
      <Header>
        <Title>Decentralized Active Learning</Title>
        <Subtitle>Collaborative ML with Privacy-Preserving Blockchain Integration</Subtitle>
      </Header>
      
      {!account ? renderWalletConnection() : renderInitializationPanel()}
    </PanelContainer>
  );
}; 