import { createHash } from "crypto";

function main() {
  class CryptoCurrency {
    private DECIMALS = 8;
    private TOTAL_SUPPLY = 21_000_000;

    getDecimals() {
      return this.DECIMALS;
    }

    getTotalSupply() {
      return this.TOTAL_SUPPLY;
    }
  }

  class Blockchain {
    private cryptoCurrency: CryptoCurrency;
    private blockLimit = 1_000_000; // 1MB

    constructor(
      private chain: Block[],
      private difficulty: number,
      private blockReward: number
    ) {}

    getCryptoCurrency() {
      return this.cryptoCurrency;
    }
  }

  class Transaction {
    constructor(
      private fromAddress: string | null, // null indicates a newly mined coin (reward)
      private toAddress: string,
      private amount: number,
      private timestamp: number = new Date().getTime(),
      private signature: string | null = null
    ) {}

    calculateHash() {
      return createHash("sha256")
        .update(
          `${this.fromAddress}${this.toAddress}${this.amount}${this.timestamp}${this.signature}`
        )
        .digest("hex");
    }
  }

  class Network {
    private nodes: Node[] = [];
    private transactionPool: Transaction[] = [];

    static instance: Network;

    constructor() {
      if (Network.instance) {
        return Network.instance;
      }
      Network.instance = this;
    }

    // New transactions are broadcast to all nodes
    broadcastTransaction(transaction: Transaction) {
      this.transactionPool.push(transaction);

      this.nodes.forEach((node) => {
        // send transaction to node
      });
    }

    registerNode(node: Node) {
      this.nodes.push(node);
    }

    removeNode(node: Node) {
      this.nodes = this.nodes.filter((n) => n !== node);
    }
  }

  class Node {
    private pendingTransactions: Transaction[] = [];

    constructor(private ipAddress: string) {}

    getIpAddress() {
      return this.ipAddress;
    }

    // Each node collects new transactions into a block
    receiveTransaction(transaction: Transaction) {
      // add transaction to mempool
    }

    // Each node works on finding a difficult proof-of-work for its block
    mineBlock() {
      // mine block
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
      this.pendingTransactions.push(transaction);
    }
  }

  type BlockHeader = {
    previousBlockHash: string;
    nonce: number;
  };

  class Block {
    constructor(
      private transactions: Transaction[],
      private blockHeader: BlockHeader
    ) {}
  }

  class Wallet {
    private network: Network = new Network(); // Network is a singleton

    constructor(private address: string) {}

    // Wallets can send transactions to other wallets
    sendTransaction(to: string, amount: number) {
      // create transaction
      const transaction = new Transaction(this.address, to, amount);
      // broadcast transaction
      this.network.broadcastTransaction(transaction);
    }

    getAddress() {
      return this.address;
    }
  }

  const bob = new Wallet("1BoatSLRHtKNngkdXEeobR76b53LETtpyT");
  const alice = new Wallet("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy");

  // Bob send 10 bitcoins to Alice
  bob.sendTransaction(alice.getAddress(), 10);
}

main();
