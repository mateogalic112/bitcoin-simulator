import { Block } from "./Block";
import { Node } from "./Node";
import { Transaction } from "./Transaction";

type CryptoCurrency = {
  decimals: number;
  totalSupply: number;
};

export class Blockchain {
  static instance: Blockchain;
  public chain: Block[] = [];

  public cryptoCurrency: CryptoCurrency = {
    decimals: 8,
    totalSupply: 21_000_000,
  };

  public blockLimit = 1_000_000; // 1MB

  public nodes: Node[] = [];
  public difficultyTarget: string = "1234";
  public blockReward: number = 50;

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
      if (node !== broadcastingNode && node.validateBlock(block)) {
        acc++;
      }
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
