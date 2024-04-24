export type TransactionInput = {
  fromAddress: string | null; // null indicates a newly mined coin (reward)
  toAddress: string;
  amount: number;
  fee: number;
  timestamp: number;
};

export class Transaction {
  private TRANSACTION_SIZE = 1_000_000 / 4; // 250KB

  constructor(
    public input: TransactionInput,
    public signature: string,
    public hash: string
  ) {}

  getTransactionSize() {
    return this.TRANSACTION_SIZE;
  }
}
