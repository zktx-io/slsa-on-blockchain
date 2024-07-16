import { Avatar, Box, Button, Card, Flex, Link, Text } from '@radix-ui/themes';
import { useRecoilState } from 'recoil';

import { docDataState } from '../recoil';

export const Provenance = () => {
  const [state] = useRecoilState(docDataState);
  console.log(state);
  return (
    <>
      {state && (
        <Flex direction="column" gap="2">
          <Box maxWidth="240px">
            <Card>
              <Flex gap="3" align="center">
                <Avatar
                  size="3"
                  src={`/logo/${state.network.split(':')[0]}.svg`}
                  fallback="T"
                />
                <Box>
                  <Text as="div" size="2" weight="bold">
                    {state.network}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    {state.name}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>
          <Box>
            <Card>
              <Flex gap="3" align="start" direction="column">
                <Text as="div" size="3" weight="bold">
                  Built and signed on Github Actions
                </Text>
                <Flex direction="column" gap="1" maxWidth="420px">
                  <Flex direction="column">
                    <Text size="2">Build Summary</Text>
                    <Link size="1" color="gray" href={state.provenance.summary}>
                      <Flex>
                        <Text truncate>{state.provenance.summary}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                  <Flex direction="column">
                    <Text size="2">Source Commit</Text>
                    <Link size="1" color="gray" href={state.provenance.commit}>
                      <Flex>
                        <Text truncate>{state.provenance.commit}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                  <Flex direction="column">
                    <Text size="2">Build Workflow</Text>
                    <Link
                      size="1"
                      color="gray"
                      href={state.provenance.workflow}
                    >
                      <Flex>
                        <Text truncate>{state.provenance.workflow}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                  <Flex direction="column">
                    <Text size="2">Public Ledger</Text>
                    <Link size="1" color="gray" href={state.provenance.ledger}>
                      <Flex>
                        <Text truncate>{state.provenance.ledger}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                </Flex>
                <Button>Sign</Button>
              </Flex>
            </Card>
          </Box>
        </Flex>
      )}
    </>
  );
};
