import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';

import { Loading } from './component/Loading';
import { Sui } from './component/Sui';
import { docDataState } from './recoil';

const queryClient = new QueryClient();

function App() {
  const [state] = useRecoilState(docDataState);

  return (
    <>
      {!state && <Loading />}
      {!!state && state.network.split(':')[0] === 'sui' && (
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider
            defaultNetwork="mainnet"
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
