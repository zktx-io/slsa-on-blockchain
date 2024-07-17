import { atom } from 'recoil';

import type { DocData } from '../../functions/src/types';

interface State {
  uid: string;
  data: DocData;
  files: {
    [fileName: string]: Uint8Array;
  };
}

export const STATE = atom<State | undefined>({
  key: 'State',
  default: undefined,
});
