import { Wallet } from "./models/Wallet";
import { Node } from "./models/Node";

function main() {
  const satoshiWallet = new Wallet();
  const satoshi = new Node("138.21.124.190", satoshiWallet.address);
  satoshi.createGenesisBlock();
  satoshi.startMining();

  const markWallet = new Wallet();
  new Node("16.205.235.171", markWallet.address).startMining();

  const alice = new Wallet();

  // Satoshi sends bitcoins to Alice
  satoshiWallet.makeTransaction(alice.address, 10, 0.1);

  return 0;
}

main();
