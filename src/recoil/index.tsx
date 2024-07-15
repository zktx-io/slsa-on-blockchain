import { atom } from 'recoil';

import type { DocData } from '../../functions/src/types';

export const docDataState = atom<DocData | undefined>({
  key: 'DocData',
  default: undefined,
});
