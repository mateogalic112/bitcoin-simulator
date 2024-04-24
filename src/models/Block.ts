import { Transaction } from "./Transaction";

export type BlockHeader = {
  previousBlockHash: string;
  timestamp: number;
  nonce: number;
  difficultyTarget: number;
};

export type Block = {
  hash: string;
  transactions: Transaction[];
  blockHeader: BlockHeader;
};
