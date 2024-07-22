import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';

import { Sui } from './component/chains/Sui';
import { Loading } from './component/Loading';
import { STATE } from './recoil';

const queryClient = new QueryClient();

function App() {
  const [state] = useRecoilState(STATE);

  return (
    <>
      {!state && <Loading />}
      {!!state && state.data.network.split(':')[0] === 'sui' && (
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider
            networks={{
              mainnet: { url: getFullnodeUrl('mainnet') },
              testnet: { url: getFullnodeUrl('testnet') },
              devnet: { url: getFullnodeUrl('devnet') },
            }}
          >
            <WalletProvider>
              <Sui />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      )}
    </>
  );
}

export default App;
