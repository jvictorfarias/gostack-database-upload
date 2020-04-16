import { getRepository, getCustomRepository } from 'typeorm';

import Category from '../models/Category';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Response {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Response> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (
      !(await categoryRepository.findOne({
        where: { title: category },
      }))
    ) {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
    }

    const transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (transactionCategory === undefined) {
      throw new AppError('Database error.');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: transactionCategory.id,
    });

    await transactionRepository.save(transaction);

    return {
      title,
      value,
      type,
      category,
    };
  }
}

export default CreateTransactionService;
