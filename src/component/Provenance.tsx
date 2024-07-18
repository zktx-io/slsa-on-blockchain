import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { fromB64 } from '@mysten/sui/utils';
import { Avatar, Box, Card, Flex, Link, Text } from '@radix-ui/themes';
import { useRecoilState } from 'recoil';

import { STATE } from '../recoil';

interface GithubAction {
  summary: string; // build summary
  commit: string; // source commit
  workflow: string; // build workflow
  ledger: string; // public ledger
}

export const Provenance = ({ BtnSign }: { BtnSign: ReactElement }) => {
  const [state] = useRecoilState(STATE);
  const [gha, setGha] = useState<GithubAction | undefined>(undefined);

  useEffect(() => {
    if (state && !gha) {
      const provenance = JSON.parse(
        new TextDecoder().decode(fromB64(state.data.provenance)),
      );
      const payload = JSON.parse(
        new TextDecoder().decode(fromB64(provenance.payload)),
      );
      setGha({
        summary: `https://github.com/zktx-io/move_on_github_action/actions/runs/${payload.predicate.invocation.environment.github_run_id}/attempts/${payload.predicate.invocation.environment.github_run_attempt}`,
        commit: `https://github.com/zktx-io/move_on_github_action/tree/${payload.predicate.invocation.environment.github_sha1}`,
        workflow: `https://github.com/zktx-io/move_on_github_action/actions/runs/${payload.predicate.invocation.environment.github_run_id}/workflow`,
        ledger: `https://search.sigstore.dev/?hash=${payload.subject[0].digest.sha256}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      {state && gha && (
        <Flex direction="column" gap="2">
          <Box maxWidth="240px">
            <Card>
              <Flex gap="3" align="center">
                <Avatar
                  size="3"
                  src={`/logo/${state.data.network.split(':')[0]}.svg`}
                  fallback="T"
                />
                <Box>
                  <Text as="div" size="2" weight="bold">
                    {state.data.network}
                  </Text>
                  <Text as="div" size="2" color="gray">
                    {state.data.name}
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Box>
          <Box>
            <Card>
              <Flex gap="3" align="start" direction="column">
                <Text as="div" size="3" weight="bold">
                  Building and Deploying with GitHub Actions
                </Text>
                <Flex direction="column" gap="1" maxWidth="420px">
                  <Flex direction="column">
                    <Text size="2">Build Summary</Text>
                    <Link
                      size="1"
                      color="gray"
                      href={gha.summary}
                      target="_blank"
                    >
                      <Flex>
                        <Text truncate>{gha.summary}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                  <Flex direction="column">
                    <Text size="2">Source Commit</Text>
                    <Link
                      size="1"
                      color="gray"
                      href={gha.commit}
                      target="_blank"
                    >
                      <Flex>
                        <Text truncate>{gha.commit}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                  <Flex direction="column">
                    <Text size="2">Build Workflow</Text>
                    <Link
                      size="1"
                      color="gray"
                      href={gha.workflow}
                      target="_blank"
                    >
                      <Flex>
                        <Text truncate>{gha.workflow}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                  <Flex direction="column">
                    <Text size="2">Public Ledger</Text>
                    <Link
                      size="1"
                      color="gray"
                      href={gha.ledger}
                      target="_blank"
                    >
                      <Flex>
                        <Text truncate>{gha.ledger}</Text>
                      </Flex>
                    </Link>
                  </Flex>
                </Flex>
                {BtnSign}
              </Flex>
            </Card>
          </Box>
        </Flex>
      )}
    </>
  );
};
