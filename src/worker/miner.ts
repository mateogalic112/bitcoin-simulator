import { parentPort, workerData } from "worker_threads";
import { createHash } from "crypto";
import { BlockHeader } from "../models/Block";
import { type Transaction } from "../models/Transaction";

function calculateHash(blockHeader: BlockHeader, transactions: Transaction[]) {
  const data = `${blockHeader.previousBlockHash}${blockHeader.timestamp}${
    blockHeader.nonce
  }${blockHeader.difficultyTarget}${JSON.stringify(transactions)}`;

  return createHash("sha256").update(data).digest("hex");
}

function proofOfWork(
  blockHeader: BlockHeader,
  blockTransactions: Transaction[],
  difficultyTarget: number
) {
  let hashResult = calculateHash(blockHeader, blockTransactions);
  // Hash has to start with difficultyTarget number of zeros ti be valid
  while (!hashResult.startsWith("0".repeat(difficultyTarget))) {
    blockHeader.nonce++;
    hashResult = calculateHash(blockHeader, blockTransactions);
  }
  return { blockNonce: blockHeader.nonce, hashResult };
}

if (parentPort) {
  parentPort!.postMessage(
    proofOfWork(
      workerData.blockHeader,
      workerData.blockTransactions,
      workerData.difficultyTarget
    )
  );
}
