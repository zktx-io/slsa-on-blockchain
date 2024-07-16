interface Provenance {
  summary: string; // build summary
  commit: string; // source commit
  workflow: string; // build workflow
  ledger: string; // public ledger
}

export interface DocData {
  network: string;
  project: string;
  name: string; // packageName
  provenance: Provenance;
  serializedSignedTx?: string;
}
