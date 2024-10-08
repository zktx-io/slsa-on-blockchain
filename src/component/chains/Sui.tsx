import { useState } from 'react';

import {
  ConnectButton,
  useCurrentAccount,
  useSignTransaction,
  useSuiClientContext,
} from '@mysten/dapp-kit';
import { SuiClient } from '@mysten/sui/client';
import { Transaction, UpgradePolicy } from '@mysten/sui/transactions';
import { Button, Flex } from '@radix-ui/themes';
import { enqueueSnackbar } from 'notistack';
import { useRecoilState } from 'recoil';

import { STATE } from '../../recoil';
import { Provenance } from '../Provenance';
import { parseMoveToml } from '../utils/parseMoveToml';

import type { ITomlUpgrade } from '../utils/parseMoveToml';

export const Sui = () => {
  const { networks, selectNetwork } = useSuiClientContext();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const account = useCurrentAccount();
  const [state] = useRecoilState(STATE);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Sign');

  const handleSign = async () => {
    if (state && account) {
      setDisabled(true);
      const network = state.data.network.split('/')[1];
      selectNetwork(network);
      const { modules, dependencies, digest } = JSON.parse(
        new TextDecoder().decode(state.files['bytecode.dump.json']),
      ) as {
        modules: string[];
        dependencies: string[];
        digest: number[];
      };

      const transaction = new Transaction();
      transaction.setSender(account.address);

      if (state.files['Upgrade.toml']) {
        const {
          upgrade: { package_id, upgrade_cap },
        } = parseMoveToml<ITomlUpgrade>(state.files['Upgrade.toml']);
        const cap = transaction.object(upgrade_cap);
        const ticket = transaction.moveCall({
          target: '0x2::package::authorize_upgrade',
          arguments: [
            cap,
            transaction.pure.u8(UpgradePolicy.COMPATIBLE),
            transaction.pure(digest as any),
          ],
        });
        const receipt = transaction.upgrade({
          modules,
          dependencies,
          package: package_id,
          ticket,
        });
        transaction.moveCall({
          target: '0x2::package::commit_upgrade',
          arguments: [cap, receipt],
        });
        const client = new SuiClient(networks[network] as { url: string });
        const { input } = await client.dryRunTransactionBlock({
          transactionBlock: await transaction.build({ client }),
        });
        transaction.setGasBudget(parseInt(input.gasData.budget));
      } else {
        transaction.transferObjects(
          [
            transaction.publish({
              modules,
              dependencies,
            }),
          ],
          account.address,
        );
      }

      try {
        const { bytes, signature } = await signTransaction({
          transaction,
          chain: `sui:${network}`,
        });
        await fetch('https://update-jx4b2hndxq-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: state.uid,
            signedData: {
              message: bytes,
              signature,
            },
          }),
        });
        setTitle('Done');
      } catch (e: any) {
        enqueueSnackbar(e.message, {
          variant: 'error',
        });
        setDisabled(false);
      }
    }
  };

  return (
    <Flex
      gap="3"
      direction="column"
      align="center"
      justify="center"
      height="100vh"
    >
      {state && account && (
        <Provenance
          BtnSign={
            <Button mt="2" onClick={handleSign} disabled={disabled}>
              {title}
            </Button>
          }
        />
      )}
      {!account && <ConnectButton />}
    </Flex>
  );
};
