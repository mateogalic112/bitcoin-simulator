import { Wallet } from "./models/Wallet";
import { Node } from "./models/Node";

function main() {
  const satoshi = new Wallet();
  new Node("138.21.124.190", satoshi.address).startMining();

  const mark = new Wallet();
  new Node("16.205.235.171", mark.address).startMining();

  const alice = new Wallet();

  // Satoshi sends bitcoins to Alice
  satoshi.makeTransaction(alice.address, 10, 0.1);

  return 0;
}

main();
