/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

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

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const csvPath = path.join(uploadConfig.directory, filename);

    if (!(await fs.promises.stat(csvPath))) {
      throw new AppError('File not found');
    }

    const parsedTransactions = await csv({
      checkType: true,
    }).fromFile(csvPath);

    for (const transaction of parsedTransactions) {
      const { title, type, value, category } = transaction;
      await createTransaction.execute({
        title,
        type,
        value,
        category,
      });
    }

    await fs.promises.unlink(csvPath);

    return parsedTransactions;
  }
}

export default ImportTransactionsService;
