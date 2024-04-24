import { Wallet } from "./models/Wallet";
import { Node } from "./models/Node";

function main() {
  const markWallet = new Wallet();
  const emaWallet = new Wallet();

  new Node("16.205.235.171", markWallet.address);
  new Node("21.25.59.190", emaWallet.address);

  const bob = new Wallet();
  const alice = new Wallet();

  // Bob sends bitcoins to Alice
  bob.makeTransaction(alice.address, 10, 0.1);

  return 0;
}

main();
