import { Wallet } from "./models/Wallet";
import { Node } from "./models/Node";

function main() {
  const mark = new Node("95.220.91.1");
  const ema = new Node("103.135.65.81");

  const bob = new Wallet();
  const alice = new Wallet();

  // Bob sends bitcoins to Alice
  bob.makeTransaction(alice.getAddress(), 10, 0.1);

  return 0;
}

main();
