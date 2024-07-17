import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Flex } from '@radix-ui/themes';
import { useRecoilState } from 'recoil';

import { STATE } from '../../recoil';
import { Provenance } from '../Provenance';

export const Sui = () => {
  const currentAccount = useCurrentAccount();
  const [state] = useRecoilState(STATE);

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
