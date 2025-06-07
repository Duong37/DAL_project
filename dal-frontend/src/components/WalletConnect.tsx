import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const AccountInfo = styled.div`
  font-family: monospace;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
`;

interface WalletConnectProps {
  account: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  account,
  onConnect,
  onDisconnect
}) => {
  const formatAccount = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Container>
      {account ? (
        <>
          <AccountInfo>
            Connected: {formatAccount(account)}
          </AccountInfo>
          <Button onClick={onDisconnect}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button onClick={onConnect}>
          Connect Wallet
        </Button>
      )}
    </Container>
  );
}; 