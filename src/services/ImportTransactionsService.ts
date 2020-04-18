import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';

import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface CSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  private createTransaction: CreateTransactionService;

  constructor() {
    this.createTransaction = new CreateTransactionService();
  }

  async execute({ filename }: Request): Promise<Transaction[]> {
    const csvPath = path.join(uploadConfig.directory, filename);
    if (!(await fs.promises.stat(csvPath))) {
      throw new AppError('File not found');
    }

    const parsedTransactions = await csv({
      checkType: true,
    }).fromFile(csvPath);

    const transactions = parsedTransactions.reduce(
      async (accumulator, transaction: Transaction) => {
        await accumulator;
        return this.createTransaction.execute({
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: transaction.category.toString(),
        });
      },
      Promise.resolve(),
    );

    await fs.promises.unlink(csvPath);

    return transactions;
  }
}

export default ImportTransactionsService;
