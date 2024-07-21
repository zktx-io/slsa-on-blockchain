import { useState } from 'react';

import {
  ConnectButton,
  useCurrentAccount,
  useSignTransaction,
  useSuiClientContext,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button, Flex } from '@radix-ui/themes';
import { enqueueSnackbar } from 'notistack';
import { useRecoilState } from 'recoil';

import { STATE } from '../../recoil';
import { Provenance } from '../Provenance';

export const Sui = () => {
  const ctx = useSuiClientContext();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const account = useCurrentAccount();
  const [state] = useRecoilState(STATE);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Sign');

  const handleSign = async () => {
    if (state && account) {
      setDisabled(true);
      const network = state.data.network.split('/')[1];
      ctx.selectNetwork(network);
      const { modules, dependencies } = JSON.parse(
        new TextDecoder().decode(state.files['bytecode.dump.json']),
      ) as {
        modules: string[];
        dependencies: string[];
      };
      const transaction = new Transaction();
      transaction.transferObjects(
        [
          // TODO: transaction.upgrade
          transaction.publish({
            modules,
            dependencies,
          }),
        ],
        account.address,
      );

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
