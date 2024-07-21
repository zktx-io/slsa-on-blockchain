import { parse } from 'smol-toml';

export interface IMoveDependency {
  git: string;
  subdir: string;
  rev: string;
}

export const parseMoveToml = (toml: string | Uint8Array) => {
  try {
    return parse(
      new TextDecoder().decode(
        typeof toml === 'string' ? new TextEncoder().encode(toml) : toml,
      ),
    ) as unknown as {
      package: {
        edition: string;
        name: string;
        version: string;
        authors: string[]; // TEMP
      };
      addresses: { [key: string]: string };
      dependencies: { [key: string]: IMoveDependency };
    };
  } catch (error) {
    throw new Error(`${error}`);
  }
};
