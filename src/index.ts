import { Wallet } from "./models/Wallet";
import { Node } from "./models/Node";

function main() {
  const markWallet = new Wallet();
  const emaWallet = new Wallet();

  new Node(markWallet.getAddress());
  new Node(emaWallet.getAddress());

  const bob = new Wallet();
  const alice = new Wallet();

  // Bob sends bitcoins to Alice
  bob.makeTransaction(alice.getAddress(), 10, 0.1);

  return 0;
}

main();
