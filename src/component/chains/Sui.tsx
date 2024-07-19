import { useState } from 'react';

import {
  ConnectButton,
  useCurrentAccount,
  useSignTransaction,
  useSuiClientContext,
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiObjectId, toB64 } from '@mysten/sui/utils';
import { Button, Flex } from '@radix-ui/themes';
import { enqueueSnackbar } from 'notistack';
import { useRecoilState } from 'recoil';

import { STATE } from '../../recoil';
import { Provenance } from '../Provenance';
import { getMoveObjectId } from '../utils/getMoveObjectId';
import { parseMoveToml } from '../utils/parseMoveToml';

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
      const { dependencies } = parseMoveToml(state.files['./Move.toml']);
      const ids = await getMoveObjectId({
        MoveStdlib: {
          git: 'https://github.com/MystenLabs/sui.git',
          rev: 'framework/testnet',
          subdir: 'crates/sui-framework/packages/move-stdlib',
        },
        ...dependencies,
      });
      const regex = new RegExp(
        `^\\.\\/build\\/${state.data.name}\\/bytecode_modules\\/[^\\/]+\\.mv$`,
      );
      const files = Object.keys(state.files).filter((name) => regex.test(name));
      const modules = files.map((name) => toB64(state.files[name]));
      const transaction = new Transaction();
      transaction.transferObjects(
        [
          // TODO: transaction.upgrade
          transaction.publish({
            modules,
            dependencies: ids.map((item) => normalizeSuiObjectId(item)),
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
      } catch (e: any) {
        enqueueSnackbar(e.message, {
          variant: 'error',
        });
        setDisabled(false);
      } finally {
        setTitle('Done');
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
