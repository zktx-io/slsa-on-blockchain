interface Provenance {
  summary: string; // build summary
  commit: string; // source commit
  workflow: string; // build workflow
  ledger: string; // public ledger
}

export interface DocData {
  name: string; // packageName
  network: string;
  project: string;
  provenance: Provenance;
  serializedSignedTx?: string;
}
