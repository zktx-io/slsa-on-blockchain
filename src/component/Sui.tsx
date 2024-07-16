import { useEffect } from 'react';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Flex } from '@radix-ui/themes';
import { useRecoilState } from 'recoil';

import { Provenance } from './Provenance';
import { docDataState } from '../recoil';

export const Sui = () => {
  const currentAccount = useCurrentAccount();
  const [state] = useRecoilState(docDataState);

  useEffect(() => {
    currentAccount && console.log(currentAccount.address);
  }, [currentAccount]);

  return (
    <Flex
      gap="3"
      direction="column"
      align="center"
      justify="center"
      height="100vh"
    >
      {state && currentAccount && <Provenance />}
      {!currentAccount && <ConnectButton />}
    </Flex>
  );
};
