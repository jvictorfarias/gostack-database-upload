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
  id: string;
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

    const categoryCapitalized =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const { total } = await transactionRepository.getBalance();

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid type');
    }
    if (type === 'outcome' && value > total) {
      throw new AppError('Not enough cash');
    }

    if (
      !(await categoryRepository.findOne({
        where: { title: categoryCapitalized },
      }))
    ) {
      const newCategory = categoryRepository.create({
        title: categoryCapitalized,
      });
      await categoryRepository.save(newCategory);
    }

    const transactionCategory = await categoryRepository.findOne({
      where: { title: categoryCapitalized },
    });

    if (transactionCategory === undefined) {
      throw new AppError('Database error.');
    }
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: transactionCategory.id,
      category: transactionCategory,
    });

    const { id } = await transactionRepository.save(transaction);

    return {
      id,
      title,
      value,
      type,
      category,
    };
  }
}

export default CreateTransactionService;
