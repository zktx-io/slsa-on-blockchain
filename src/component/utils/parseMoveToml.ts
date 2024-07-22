import { parse } from 'smol-toml';

export interface IMoveDependency {
  git: string;
  subdir: string;
  rev: string;
}

export interface ITomlMove {
  package: {
    edition: string;
    name: string;
    version: string;
  };
  addresses: { [key: string]: string };
  dependencies: { [key: string]: IMoveDependency };
}

export interface ITomlUpgrade {
  upgrade: {
    package_id: string;
    upgrade_cap: string;
  };
}

export const parseMoveToml = <T>(toml: string | Uint8Array): T => {
  try {
    return parse(
      new TextDecoder().decode(
        typeof toml === 'string' ? new TextEncoder().encode(toml) : toml,
      ),
    ) as T;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
