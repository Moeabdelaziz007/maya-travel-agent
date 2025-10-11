/**
 * Blockchain Trust Layer - Lean Implementation
 * Simple blockchain for audit trail
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.data)
      )
      .digest('hex');
  }
}

class BlockchainTrustLayer {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    return new Block(
      0,
      Date.now(),
      { type: 'genesis', message: 'Amrikyy Blockchain Initialized' },
      '0'
    );
  }

  async createTransaction(transaction) {
    const txId = `tx_${Date.now()}`;

    const tx = {
      id: txId,
      ...transaction,
      timestamp: Date.now(),
      hash: this.hashData(transaction),
    };

    this.pendingTransactions.push(tx);

    logger.info('Transaction created', { txId, type: transaction.type });

    return tx;
  }

  async minePendingTransactions(validator = 'system') {
    if (this.pendingTransactions.length === 0) return null;

    const block = new Block(
      this.chain.length,
      Date.now(),
      { transactions: this.pendingTransactions, validator },
      this.chain[this.chain.length - 1].hash
    );

    this.chain.push(block);

    const count = this.pendingTransactions.length;
    this.pendingTransactions = [];

    logger.info('Block mined', { index: block.index, txCount: count });

    return block;
  }

  verifyTransaction(txId) {
    for (const block of this.chain) {
      if (block.data.transactions) {
        const tx = block.data.transactions.find((t) => t.id === txId);
        if (tx) {
          return {
            verified: true,
            transaction: tx,
            block: { index: block.index, hash: block.hash },
          };
        }
      }
    }
    return { verified: false };
  }

  getBlockchainInfo() {
    return {
      blocks: this.chain.length,
      pendingTransactions: this.pendingTransactions.length,
      isValid: this.isChainValid(),
    };
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  hashData(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  getUserTransactionHistory(userId) {
    const transactions = [];

    for (const block of this.chain) {
      if (block.data.transactions) {
        transactions.push(
          ...block.data.transactions.filter((t) => t.userId === userId)
        );
      }
    }

    return transactions;
  }

  async recordTripBooking(bookingData) {
    return this.createTransaction({
      type: 'trip_booking',
      userId: bookingData.userId,
      data: bookingData,
    });
  }

  async recordPayment(paymentData) {
    return this.createTransaction({
      type: 'payment',
      userId: paymentData.userId,
      data: paymentData,
    });
  }
}

module.exports = new BlockchainTrustLayer();
