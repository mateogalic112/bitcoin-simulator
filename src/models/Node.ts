import { createHash } from "crypto";
import { Block, BlockHeader } from "./Block";
import { Blockchain } from "./Blockchain";
import { Transaction } from "./Transaction";

export class Node {
  private mempool: Transaction[] = [];
  private blockchain: Blockchain = new Blockchain();

  constructor(private receivingAddress: string) {
    // register node with blockchain
    this.blockchain.registerNode(this);
  }

  // Each node collects new transactions into a block
  receiveTransaction(transaction: Transaction) {
    this.mempool.push(transaction);
  }

  // Each node works on finding a difficult proof-of-work for its block
  mineBlock() {
    const previousBlock =
      this.blockchain.chain[this.blockchain.chain.length - 1];
    const previousBlockHash = previousBlock.blockHeader.previousBlockHash;

    const blockHeader: BlockHeader = {
      previousBlockHash,
      nonce: 0,
      timestamp: Date.now(),
      difficultyTarget: this.blockchain.difficultyTarget,
    };

    const poolTransactions = this.mempool
      .sort((a, b) => b.input.fee - a.input.fee)
      .slice(0, 3); // Simulate block size limit

    const blockTransactions = [
      this.createCoinbaseTransaction(this.receivingAddress),
      ...poolTransactions,
    ];

    const difficultyTarget = parseInt(this.blockchain.difficultyTarget);

    // Simple proof-of-work algorithm
    while (blockHeader.nonce < difficultyTarget) {
      blockHeader.nonce++;
      this.calculateHash(blockHeader, blockTransactions);
    }

    const block: Block = {
      blockHeader,
      transactions: blockTransactions,
      hash: this.calculateHash(blockHeader, blockTransactions),
    };
    this.broadcastBlock(block);
  }

  // When a node finds a proof-of-work, it broadcasts the block to all nodes
  broadcastBlock(block: Block) {
    // send block to network
  }

  // Nodes accept the block only if all transactions in it are valid and not already spent
  validateBlock(block: Block) {
    // validate block
  }

  // Miners select from a pool of transactions, verifying that the sender has sufficient funds to complete the transaction
  validateTransaction(transaction: Transaction) {
    // validate transaction
    return true;
  }

  private calculateHash(
    blockHeader: BlockHeader,
    transactions: Transaction[]
  ): string {
    const data = `${blockHeader.previousBlockHash}${blockHeader.timestamp}${
      blockHeader.nonce
    }${blockHeader.difficultyTarget}${JSON.stringify(
      transactions.map((t) => t.hash)
    )}`;

    return createHash("sha256").update(data).digest("hex");
  }

  private createCoinbaseTransaction(toAddress: string) {
    return new Transaction(
      {
        fromAddress: null,
        toAddress,
        amount: 50,
        fee: 0,
      },
      "",
      ""
    );
  }
}
