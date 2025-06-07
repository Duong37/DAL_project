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

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#495057'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#0056b3' : '#e9ecef'};
  }
`;

const StatsPanel = styled.div`
  background: #f1f3f4;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #dadce0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #5f6368;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-weight: bold;
  font-size: 18px;
  color: #1a73e8;
`;

const DataContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
`;

const DataItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const HashDisplay = styled.div`
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  margin: 4px 0;
  border-left: 3px solid #28a745;
`;

const DataField = styled.div`
  margin: 4px 0;
`;

const FieldLabel = styled.span`
  color: #6c757d;
  font-weight: bold;
`;

const PrivacyHighlight = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
`;

const ComparisonPanel = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
`;

const ComparisonSection = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 12px;
  font-weight: bold;
  text-align: center;
`;

const SectionContent = styled.div`
  padding: 12px;
  background: white;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  padding: 32px;
`;

interface BlockchainSimulationProps {
  blockchainData: {
    on_chain: {
      vote_records: any[];
      model_updates: any[];
      total_blocks: number;
      total_gas_used: number;
      storage_size_kb: number;
    };
    off_chain: {
      vote_data: any[];
      model_data: any[];
      storage_size_kb: number;
    };
    privacy_stats: {
      data_reduction_ratio: number;
      features_hidden_on_chain: number;
      only_hashes_on_chain: number;
      full_audit_trail_available: boolean;
    };
  } | null;
}

export const BlockchainSimulation: React.FC<BlockchainSimulationProps> = ({ blockchainData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'on-chain' | 'off-chain' | 'comparison'>('overview');

  if (!blockchainData) {
    return (
      <Container>
        <Title>Blockchain Simulation</Title>
        <EmptyState>Loading blockchain simulation...</EmptyState>
      </Container>
    );
  }

  const { on_chain, off_chain, privacy_stats } = blockchainData;

  const renderOverview = () => (
    <div>
      <StatsPanel>
        <h4 style={{ margin: '0 0 12px 0', color: '#5f6368' }}>Blockchain Analytics</h4>
        <StatsGrid>
          <StatItem>
            <StatLabel>Total Blocks</StatLabel>
            <StatValue>{on_chain.total_blocks}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Gas Used</StatLabel>
            <StatValue>{on_chain.total_gas_used.toLocaleString()}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>On-Chain Storage</StatLabel>
            <StatValue>{on_chain.storage_size_kb.toFixed(1)} KB</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Off-Chain Storage</StatLabel>
            <StatValue>{off_chain.storage_size_kb.toFixed(1)} KB</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Features Hidden</StatLabel>
            <StatValue>{privacy_stats.features_hidden_on_chain}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Privacy Ratio</StatLabel>
            <StatValue>{privacy_stats.data_reduction_ratio.toFixed(2)}x</StatValue>
          </StatItem>
        </StatsGrid>
      </StatsPanel>

      <PrivacyHighlight>
        <strong>Privacy Benefits:</strong> Only {privacy_stats.only_hashes_on_chain} hashes stored on-chain, 
        keeping {privacy_stats.features_hidden_on_chain} sensitive features private. 
        Full audit trail available while maintaining data privacy.
      </PrivacyHighlight>
    </div>
  );

  const renderOnChain = () => (
    <div>
      <h4>On-Chain Data (Public Blockchain)</h4>
      <p style={{ color: '#6c757d', fontSize: '14px' }}>
        Only hashes and minimal metadata stored on the public blockchain for transparency and immutability.
      </p>
      <DataContainer>
        {[...on_chain.vote_records, ...on_chain.model_updates].map((record, index) => (
          <DataItem key={index}>
            <DataField>
              <FieldLabel>Block:</FieldLabel> #{record.block_number}
            </DataField>
            <DataField>
              <FieldLabel>Timestamp:</FieldLabel> {record.timestamp}
            </DataField>
            {record.vote_hash && (
              <>
                <DataField>
                  <FieldLabel>Vote Hash:</FieldLabel>
                </DataField>
                <HashDisplay>{record.vote_hash}</HashDisplay>
                <DataField>
                  <FieldLabel>Sample ID:</FieldLabel> {record.sample_id}
                </DataField>
                <DataField>
                  <FieldLabel>Voter:</FieldLabel> {record.voter_address}
                </DataField>
              </>
            )}
            {record.update_hash && (
              <>
                <DataField>
                  <FieldLabel>Update Hash:</FieldLabel>
                </DataField>
                <HashDisplay>{record.update_hash}</HashDisplay>
                <DataField>
                  <FieldLabel>Trigger:</FieldLabel> {record.trigger_sample}
                </DataField>
                <DataField>
                  <FieldLabel>Performance:</FieldLabel> Acc: {(record.performance_improvement.accuracy_change * 100).toFixed(2)}%, 
                  F1: {(record.performance_improvement.f1_change * 100).toFixed(2)}%
                </DataField>
              </>
            )}
            <DataField>
              <FieldLabel>Gas Used:</FieldLabel> {record.gas_used.toLocaleString()}
            </DataField>
          </DataItem>
        ))}
      </DataContainer>
    </div>
  );

  const renderOffChain = () => (
    <div>
      <h4>Off-Chain Data (Private Storage)</h4>
      <p style={{ color: '#6c757d', fontSize: '14px' }}>
        Full sample data and model information stored privately, linked to on-chain hashes.
      </p>
      <DataContainer>
        {off_chain.vote_data.map((data, index) => (
          <DataItem key={index}>
            <DataField>
              <FieldLabel>Hash Reference:</FieldLabel>
            </DataField>
            <HashDisplay>{data.hash}</HashDisplay>
            <DataField>
              <FieldLabel>Sample Features:</FieldLabel> {Object.keys(data.sample_features).length} features
            </DataField>
            <DataField>
              <FieldLabel>Feature Sample:</FieldLabel> 
              {Object.entries(data.sample_features).slice(0, 3).map(([name, value]) => 
                `${name}: ${typeof value === 'number' ? value.toFixed(3) : value}`
              ).join(', ')}...
            </DataField>
            <DataField>
              <FieldLabel>Model State:</FieldLabel> 
              Pred: {data.model_state.prediction}, 
              Conf: {(data.model_state.confidence * 100).toFixed(1)}%, 
              Unc: {data.model_state.uncertainty.toFixed(3)}
            </DataField>
            <DataField>
              <FieldLabel>Labels:</FieldLabel> 
              User: {data.label_data.user_label}, 
              True: {data.label_data.true_label}, 
              Correct: {data.label_data.correct ? '✓' : '✗'}
            </DataField>
          </DataItem>
        ))}
      </DataContainer>
    </div>
  );

  const renderComparison = () => (
    <ComparisonPanel>
      <ComparisonSection>
        <SectionHeader color="#dc3545">On-Chain Limitations</SectionHeader>
        <SectionContent>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>High gas costs for data storage</li>
            <li>Public visibility of all data</li>
            <li>Immutable but expensive</li>
            <li>Limited storage capacity</li>
            <li>Privacy concerns for sensitive data</li>
          </ul>
        </SectionContent>
      </ComparisonSection>

      <ComparisonSection>
        <SectionHeader color="#28a745">Hybrid Solution Benefits</SectionHeader>
        <SectionContent>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Minimal on-chain storage (hashes only)</li>
            <li>Private sensitive data storage</li>
            <li>Immutable audit trail</li>
            <li>Cost-effective solution</li>
            <li>Verifiable without exposing data</li>
          </ul>
        </SectionContent>
      </ComparisonSection>
    </ComparisonPanel>
  );

  return (
    <Container>
      <Title>Blockchain Simulation</Title>
      
      <TabContainer>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </Tab>
        <Tab active={activeTab === 'on-chain'} onClick={() => setActiveTab('on-chain')}>
          On-Chain Data
        </Tab>
        <Tab active={activeTab === 'off-chain'} onClick={() => setActiveTab('off-chain')}>
          Off-Chain Data
        </Tab>
        <Tab active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')}>
          Comparison
        </Tab>
      </TabContainer>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'on-chain' && renderOnChain()}
      {activeTab === 'off-chain' && renderOffChain()}
      {activeTab === 'comparison' && renderComparison()}
    </Container>
  );
}; 