import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const Wallet = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        defaultNetwork="mainnet"
        networks={{
          mainnet: { url: getFullnodeUrl('mainnet') },
          testnet: { url: getFullnodeUrl('testnet') },
          devnet: { url: getFullnodeUrl('devnet') },
        }}
      >
        <WalletProvider>Test</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};
