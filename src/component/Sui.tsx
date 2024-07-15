import { useEffect } from 'react';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Button, Card, Flex, Link, Text } from '@radix-ui/themes';
import { useRecoilState } from 'recoil';

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
      {state && currentAccount && (
        <Card>
          <Flex gap="3" align="start" direction="column">
            <Text as="div" size="4" weight="bold">
              Built and signed on Github Actions
            </Text>
            <Flex direction="column">
              <Flex gap="2">
                <Text size="2">Build Summary</Text>
                <Link color="gray" size="2" href={state.provenance.summary}>
                  {state.provenance.summary}
                </Link>
              </Flex>
              <Flex gap="2">
                <Text size="2">Source Commit</Text>
                <Link color="gray" size="2" href={state.provenance.commit}>
                  {state.provenance.commit}
                </Link>
              </Flex>
              <Flex gap="2">
                <Text size="2">Build Workflow</Text>
                <Link color="gray" size="2" href={state.provenance.workflow}>
                  {state.provenance.workflow}
                </Link>
              </Flex>
              <Flex gap="2">
                <Text size="2">Public Ledger</Text>
                <Link color="gray" size="2" href={state.provenance.ledger}>
                  {state.provenance.ledger}
                </Link>
              </Flex>
            </Flex>
            <Button>Sign</Button>
          </Flex>
        </Card>
      )}
      {!currentAccount && <ConnectButton />}
    </Flex>
  );
};
