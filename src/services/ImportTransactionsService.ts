import path from 'path';
import fs from 'fs';
import csv from 'csvtojson';

import uploadConfig from '../config/upload';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
  createTransaction: CreateTransactionService;
}

class ImportTransactionsService {
  async execute({
    filename,
    createTransaction,
  }: Request): Promise<Transaction[]> {
    const csvPath = path.join(uploadConfig.directory, filename);
    if (!(await fs.promises.stat(csvPath))) {
      throw new AppError('File not found');
    }

    // fs.createReadStream(csvPath)
    //   .pipe(
    //     csv({
    //       headers: ['title', 'type', 'value', 'category'],
    //       mapHeaders: ({ header }) => header.toLowerCase(),
    //       mapValues: ({ header, value }) =>
    //         header === 'category' ? value.toLowerCase().trim() : value.trim(),
    //     }),
    //   )
    //   .on('data', data => transactions.push(data));
    //
    // console.log(transactions);
    //

    const parsedTransactions = await csv({
      checkType: true,
    }).fromFile(csvPath);

    parsedTransactions.map(async transaction => {
      const { title, type, value, category } = transaction;
      await createTransaction.execute({
        title,
        type,
        value,
        category,
      });
    });

    await fs.promises.unlink(csvPath);

    return parsedTransactions;
  }
}

export default ImportTransactionsService;
