import { createHash, createSign, generateKeyPairSync } from "crypto";
import { Blockchain } from "./Blockchain";
import { Transaction, TransactionInput } from "./Transaction";

export class Wallet {
  private blockchain: Blockchain;

  public address: string;
  private privateKey: string;
  private publicKey: string;

  constructor() {
    this.blockchain = new Blockchain(); // Blockchain is a singleton

    const keys = this.generateKeys();
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;

    this.address = this.generateAddress(this.publicKey);
  }

  private generateAddress(publicKey: string) {
    const hash = createHash("sha256").update(publicKey).digest("hex");
    return `1${hash.substring(0, 34)}`; // Simulated Bitcoin-like address (not real)
  }

  private signTransaction(transactionInput: TransactionInput): string {
    const dataToSign = Object.values(transactionInput).join("-");
    const signer = createSign("sha256");
    signer.update(dataToSign);
    signer.end();
    const signature = signer.sign(this.privateKey, "hex");
    return signature;
  }

  private calculateTransactionHash(transactionInput: TransactionInput) {
    const dataToSign = Object.values(transactionInput).join("-");
    const signature = this.signTransaction(transactionInput);
    return createHash("sha256")
      .update(`${dataToSign}-${signature}`)
      .digest("hex");
  }

  public makeTransaction(to: string, amount: number, fee: number) {
    const input: TransactionInput = {
      fromAddress: this.address,
      toAddress: to,
      amount,
      fee,
      timestamp: Date.now(),
    };

    // create signature
    const signature = this.signTransaction(input);

    // create transaction hash
    const hash = this.calculateTransactionHash(input);

    // create transaction
    const transaction = new Transaction(input, signature, hash);

    // broadcast transaction
    this.blockchain.broadcastTransaction(transaction);
  }

  public createCoinbaseTransaction(toAddress: string) {
    const input: TransactionInput = {
      fromAddress: null,
      toAddress,
      amount: this.blockchain.blockReward,
      fee: 0,
      timestamp: Date.now(),
    };

    // create signature
    const signature = this.signTransaction(input);

    // create transaction hash
    const hash = this.calculateTransactionHash(input);

    // create transaction
    const transaction = new Transaction(input, signature, hash);

    return transaction;
  }

  private generateKeys() {
    return generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
  }
}
