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

  // Each node collects new transactions into a mempool
  receiveTransaction(transaction: Transaction) {
    this.mempool.push(transaction);
  }

  // Each node works on finding a difficult proof-of-work for its block
  mineBlock() {
    const blockHeader = this.createBlockHeader();

    // Simple transaction selection algorithm (highest fee first)
    // Block size is limited to 1MB
    const poolTransactions = this.mempool
      .sort((a, b) => b.input.fee - a.input.fee)
      .slice(0, 3); // We have fixed transaction size of 250KB for simplicity

    // Include coinbase transaction with pool transactions
    const blockTransactions = [
      this.createCoinbaseTransaction(this.receivingAddress),
      ...poolTransactions,
    ];

    // Simple proof-of-work algorithm
    let hashResult = this.calculateHash(blockHeader, blockTransactions);
    // Hash has to start with difficultyTarget number of zeros ti be valid
    while (
      !hashResult.startsWith("0".repeat(this.blockchain.difficultyTarget))
    ) {
      blockHeader.nonce++;
      hashResult = this.calculateHash(blockHeader, blockTransactions);
    }

    const block: Block = {
      blockHeader,
      transactions: blockTransactions,
      hash: hashResult,
    };

    this.broadcastBlock(block);
  }

  // When a node finds a proof-of-work, it broadcasts the block to all nodes
  broadcastBlock(block: Block) {
    // send block to network
    this.blockchain.broadcastBlockForValidation(this, block);
  }

  // Nodes accept the block only if all transactions in it are valid and not already spent
  validateBlock(block: Block) {
    // validate block
    return this.checkValidHash(block.hash);
  }

  // Miners select from a pool of transactions, verifying that the sender has sufficient funds to complete the transaction
  validateTransaction(transaction: Transaction) {
    // validate transaction
    return true;
  }

  private createBlockHeader = (): BlockHeader => {
    return {
      previousBlockHash: this.getPreviousBlockHash(),
      nonce: 0,
      timestamp: Date.now(),
      difficultyTarget: this.blockchain.difficultyTarget,
    };
  };

  private getPreviousBlockHash(): string {
    return this.blockchain.chain[this.blockchain.chain.length - 1].hash;
  }

  private checkValidHash(hash: string): boolean {
    return hash.startsWith("0".repeat(this.blockchain.difficultyTarget));
  }

  private calculateHash(
    blockHeader: BlockHeader,
    transactions: Transaction[]
  ): string {
    const data = `${blockHeader.previousBlockHash}${blockHeader.timestamp}${
      blockHeader.nonce
    }${blockHeader.difficultyTarget}${JSON.stringify(transactions)}`;

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
