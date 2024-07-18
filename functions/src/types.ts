export interface DocData {
  name: string; // packageName
  network: string;
  provenance: string;
  signedData?:
    | {
        message: string;
        signature: string;
      }
    | string;
}
