import { Block, BlockHeader } from "./Block";
import { Blockchain } from "./Blockchain";
import { Transaction } from "./Transaction";
import { Worker } from "worker_threads";
import { Wallet } from "./Wallet";

export class Node {
  private cpuPower = Math.random() * 1000; // Simulated CPU power

  private mempool: Transaction[] = [];
  private blockchain: Blockchain = new Blockchain();

  constructor(public ipAddress: string, private wallet: Wallet) {}

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

  // Each node works on finding a proof-of-work for its block
  mineBlock() {
    console.log(`Node ${this.ipAddress} is mining...`);

    const blockHeader = this.createBlockHeader();

    const blockTransactions = this.selectBlockTransactions();

    /**
     * Create a new worker thread to mine the block
     * @notice Worker thread is used to simulate mining process because it is CPU intensive
     */
    const worker = new Worker(`./build/worker/miner.js`, {
      workerData: {
        blockHeader,
        blockTransactions,
        difficultyTarget: this.blockchain.difficultyTarget,
      },
    });

    worker.on("message", (data) => {
      blockHeader.nonce = data.blockNonce as number;
      const hashResult = data.hashResult as string;

      const potentialNewBlock: Block = {
        blockHeader,
        transactions: blockTransactions,
        hash: hashResult,
      };

      if (this.validateBlock(potentialNewBlock)) {
        this.broadcastBlock(potentialNewBlock);
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

  /**
   * Select transactions to include in the block
   * @dev  Simple transaction selection algorithm (highest fee first)
   * @notice Block size is limited to 1MB
   * @returns Array of transactions to include in the block
   */
  private selectBlockTransactions() {
    const STRATING_INDEX = 0; // Slice from the beginning of array
    const ENDING_INDEX = 3; // Fixed transaction size of 250KB (3 from pool + 1 coinbase)

    const poolTransactions = [...this.filterMempoolTransactions()]
      .sort((a, b) => a.input.fee - b.input.fee)
      .slice(STRATING_INDEX, ENDING_INDEX);

    const blockTransactions = [
      this.wallet.createCoinbaseTransaction(this.wallet.address),
      ...poolTransactions,
    ];

    return blockTransactions;
  }

  // When a node finds a proof-of-work, it broadcasts the block to all nodes
  broadcastBlock(block: Block) {
    // send block to network
    this.blockchain.broadcastBlockForValidation(this, block);
  }

  // Nodes accept the block only if all transactions in it are valid and not already spent
  validateBlock(block: Block) {
    if (this.blockchain.checkBlockHashAlreadyMined(block)) return false;
    if (!this.chechValidTransactions(block)) return false;
    if (!this.checkValidHash(block)) return false;
    // TODO: check block size
    return false;
  }

  private filterMempoolTransactions() {
    // clear mempool for verified transactions
    this.mempool = this.mempool.filter(
      (transaction) =>
        !this.blockchain.chain
          .flatMap((block) => block.transactions.map((t) => t.hash))
          .includes(transaction.hash)
    );

    return this.mempool;
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

  private chechValidTransactions(block: Block): boolean {
    // check for already spent transactions
    const blockchainTxHashes = this.blockchain.chain.flatMap((block) =>
      block.transactions.map((t) => t.hash)
    );

    const blockTxHashes = block.transactions.map((t) => t.hash);

    if (blockchainTxHashes.some((hash) => blockTxHashes.includes(hash))) {
      return false;
    }

    return true;
  }

  private checkValidHash(block: Block): boolean {
    return block.hash.startsWith("0".repeat(this.blockchain.difficultyTarget));
  }
}
