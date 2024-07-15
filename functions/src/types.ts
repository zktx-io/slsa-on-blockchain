interface Provenance {
  name: string; // packageName
  summary: string; // build summary
  commit: string; // source commit
  workflow: string; // build workflow
  ledger: string; // public ledger
}

export interface DocData {
  chain: 'aptos' | 'sui';
  network: string;
  project: string;
  provenance: Provenance;
  serializedSignedTx?: string;
}
