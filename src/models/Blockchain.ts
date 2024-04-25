import { Block } from "./Block";
import { Node } from "./Node";
import { Transaction } from "./Transaction";

export class Blockchain {
  static instance: Blockchain;

  public cryptoCurrency = {
    DECIMALS: 8,
    TOTAL_SUPPLY: 21_000_000,
  };

  public chain: Block[] = [];
  public nodes: Node[] = [];

  public difficultyTarget: number = 5; // How many leading zeros the hash must have
  public blockReward: number = 50; // Starting 50 BTC per block

  public HALVING_INTERVAL: number = 210_000; // approx 4 years
  public BLOCK_SIZE_LIMIT = 1_000_000; // 1MB
  public MINING_DIFFICULTY_INTERVAL = 2016; // approx 2 weeks
  public TARGET_BLOCK_TIME = 1000 * 60 * 10; // 10 minutes

  constructor() {
    if (Blockchain.instance) {
      return Blockchain.instance;
    }
    Blockchain.instance = this;
  }

  // New transactions are broadcast to all nodes
  broadcastTransaction(transaction: Transaction) {
    this.nodes.forEach((node) => {
      node.receiveTransaction(transaction);
    });
  }

  broadcastBlockForValidation(broadcastingNode: Node, block: Block) {
    const validations = this.nodes.reduce((acc: number, node: Node) => {
      if (node.validateBlock(block)) acc++;
      return acc;
    }, 0);

    // If more than half of the nodes validate the block, add it to the chain
    if (validations > this.nodes.length / 2) {
      console.log(
        `Node ${broadcastingNode.ipAddress} added block #${block.hash} to chain!`
      );
      this.createNewBlock(block);
    }
  }

  private createNewBlock(block: Block) {
    this.chain.push(block);

    if (this.chain.length % this.HALVING_INTERVAL === 0) {
      this.adjustBlockReward();
    }
    if (this.chain.length % this.MINING_DIFFICULTY_INTERVAL === 0) {
      this.adjustDifficulty();
    }

    console.log(
      this.chain.map((b) => b.transactions.map((t) => t.input.amount))
    );
  }

  private adjustBlockReward() {
    if (this.blockReward === 0) return;
    this.calculateNewBlockReward();
  }

  private adjustDifficulty() {
    const blockProductionRate = this.getBlockProductionRate();
    if (blockProductionRate < this.TARGET_BLOCK_TIME) {
      this.difficultyTarget++;
    } else if (blockProductionRate > this.TARGET_BLOCK_TIME) {
      this.difficultyTarget--;
    }
  }

  private getBlockProductionRate() {
    const currentInterval = Math.round(
      this.chain.length / this.MINING_DIFFICULTY_INTERVAL
    );

    const lastBlock = this.chain[this.chain.length - 1];
    const startingBlock =
      this.chain[(currentInterval - 1) * this.MINING_DIFFICULTY_INTERVAL];

    return (
      (lastBlock.blockHeader.timestamp - startingBlock.blockHeader.timestamp) /
      this.MINING_DIFFICULTY_INTERVAL
    );
  }

  private calculateNewBlockReward() {
    this.blockReward = this.blockReward / 2;

    if (
      this.blockReward + this.getCurrentSupply() >
      this.cryptoCurrency.TOTAL_SUPPLY
    )
      this.blockReward = 0;
  }

  registerNode(node: Node) {
    this.nodes.push(node);
  }

  removeNode(node: Node) {
    this.nodes = this.nodes.filter((n) => n !== node);
  }

  // Only check for coinbase transactions because that is how bitcoin is created
  getCurrentSupply() {
    return this.chain.reduce((acc, block) => {
      return acc + block.transactions[0].input.amount;
    }, 0);
  }

  checkBlockHashAlreadyMined(proposedBlock: Block) {
    return !!this.chain.find(
      (block) =>
        block.blockHeader.previousBlockHash ===
        proposedBlock.blockHeader.previousBlockHash
    );
  }

  getBalance(address: string) {
    return this.chain.reduce((chainAcc, block) => {
      return (
        chainAcc +
        block.transactions.reduce((blockAcc, transaction) => {
          // If transaction is from the address, subtract the amount + fee
          if (transaction.input.fromAddress === address) {
            return blockAcc - transaction.input.amount - transaction.input.fee;
          }
          // If transaction is to the address, add the amount
          if (transaction.input.toAddress === address) {
            return blockAcc + transaction.input.amount;
          }
          // If block is coinbase transaction, miner gets all the fees
          if (block.transactions[0].input.toAddress === address) {
            return blockAcc + transaction.input.fee;
          }
          return blockAcc;
        }, 0)
      );
    }, 0);
  }
}
