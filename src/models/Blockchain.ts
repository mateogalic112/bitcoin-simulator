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

  public difficultyTarget: number = 1; // How many leading zeros the hash must have
  public blockReward: number = 50; // Starting 50 BTC per block

  public HALVING_INTERVAL: number = 210_000; // approx 4 years
  public BLOCK_LIMIT = 1_000_000; // 1MB
  public MINING_DIFFICULTY_INTERVAL = 2016; // approx 2 weeks

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
      if (node !== broadcastingNode && node.validateBlock(block)) acc++;
      return acc;
    }, 0);

    // If more than half of the nodes validate the block, add it to the chain
    if (validations > this.nodes.length / 2) {
      this.chain.push(block);
    }
  }

  registerNode(node: Node) {
    this.nodes.push(node);
  }

  removeNode(node: Node) {
    this.nodes = this.nodes.filter((n) => n !== node);
  }
}
