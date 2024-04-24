import { Block, BlockHeader } from "./Block";
import { Blockchain } from "./Blockchain";
import { Transaction } from "./Transaction";
import { Worker } from "worker_threads";

export class Node {
  private cpuPower = Math.random() * 1000; // Simulated CPU power

  private mempool: Transaction[] = [];
  private blockchain: Blockchain = new Blockchain();

  constructor(public ipAddress: string, private receivingAddress: string) {}

  startMining() {
    // register node with blockchain
    this.blockchain.registerNode(this);

    setTimeout(() => {
      this.mineBlock();
    }, (1000 * 60) / this.cpuPower);
  }

  // Each node collects new transactions into a mempool
  receiveTransaction(transaction: Transaction) {
    this.mempool.push(transaction);
  }

  // Each node works on finding a difficult proof-of-work for its block
  mineBlock() {
    console.log(`Node ${this.ipAddress} is mining...`);
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
    const worker = new Worker(`./build/worker/miner.js`, {
      workerData: {
        blockHeader,
        blockTransactions,
        difficultyTarget: this.blockchain.difficultyTarget,
      },
    });

    worker.on("message", (data) => {
      blockHeader.nonce = data.blockNonce;
      const hashResult = data.hashResult;

      if (
        !this.blockchain.chain.find(
          (block) =>
            block.blockHeader.previousBlockHash ===
            blockHeader.previousBlockHash
        )
      ) {
        const block: Block = {
          blockHeader,
          transactions: blockTransactions,
          hash: hashResult,
        };

        this.broadcastBlock(block);
      }

      worker.postMessage({ command: "shutdown" });
    });

    worker.on("exit", () => {
      setTimeout(() => {
        this.mineBlock();
      }, (1000 * 60) / this.cpuPower);
    });

    worker.on("error", (err) => {
      console.log(`Worker error: ${err}`);
      worker.terminate(); // Ensure termination even on error
    });
  }

  // When a node finds a proof-of-work, it broadcasts the block to all nodes
  broadcastBlock(block: Block) {
    // send block to network
    this.blockchain.broadcastBlockForValidation(this, block);
  }

  // Nodes accept the block only if all transactions in it are valid and not already spent
  validateBlock(block: Block) {
    // validate block
    return true;
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
    if (this.blockchain.chain.length === 0) {
      return "0".repeat(64);
    }
    return this.blockchain.chain[this.blockchain.chain.length - 1].hash;
  }

  private checkValidHash(hash: string): boolean {
    return hash.startsWith("0".repeat(this.blockchain.difficultyTarget));
  }

  private createCoinbaseTransaction(toAddress: string) {
    return new Transaction(
      {
        fromAddress: null,
        toAddress,
        amount: this.blockchain.blockReward,
        fee: 0,
      },
      "",
      ""
    );
  }
}
