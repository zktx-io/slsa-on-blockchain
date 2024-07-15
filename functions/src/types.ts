interface Provenance {
  name: string; // packageName
  summary: string; // build summary
  commit: string; // source commit
  build: string; // build file
  ledger: string; // public ledger
}

export interface DocData {
  chain: string;
  network: string;
  project: string;
  provenance: Provenance;
  signatures?: string[];
}
