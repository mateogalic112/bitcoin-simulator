import { Wallet } from "./models/Wallet";
import { Node } from "./models/Node";

function main() {
  // Create genesis node
  const satoshi = new Wallet();
  new Node("138.21.124.190", satoshi).startMining();

  // Spawn new node after 5 seconds
  setTimeout(() => {
    const mark = new Wallet();
    new Node("16.205.235.171", mark).startMining();
  }, 1000 * 5);

  // Create new user Alice
  const alice = new Wallet();

  // Satoshi sends bitcoins to Alice
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      satoshi.makeTransaction(alice.address, i, 1.5 - i * 0.1);
    }, 1000 * i);
  }

  return 0;
}

main();
