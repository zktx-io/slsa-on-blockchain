import { parseMoveToml } from './parseMoveToml';

import type { IMoveDependency } from './parseMoveToml';

export const getMoveObjectId = async (dependencies: {
  [key: string]: IMoveDependency;
}): Promise<string[]> => {
  const addresses: string[] = [];
  const temp = await Promise.all(
    Object.keys(dependencies).map(async (item): Promise<string[]> => {
      const { git, rev, subdir } = dependencies[item];
      const url = `${git.replace(/\.git$/, '').replace('https://github.com', 'https://raw.githubusercontent.com')}/${rev}/${subdir}/Move.toml`;
      const res = await fetch(url);
      const moveToml = await res.text();
      const { addresses: packageIds } = parseMoveToml(moveToml) as {
        addresses: { [key: string]: string };
      };
      const list: string[] = [];
      for (const id of Object.keys(packageIds)) {
        list.push(packageIds[id]);
      }
      return list;
    }),
  );
  for (const item of temp) {
    addresses.push(...item);
  }
  return addresses;
};
