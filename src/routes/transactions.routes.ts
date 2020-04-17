import { Router } from 'express';
import multer from 'multer';

import uploadConfig from '../config/upload';

import CreateTransactionService from '../services/CreateTransactionService';
import ListTransactionsService from '../services/ListTransactionsService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const listTransactions = new ListTransactionsService();

  const list = await listTransactions.execute();

  return response.status(200).json(list);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(200).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(200).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;

    const createTransaction = new CreateTransactionService();
    const importTransaction = new ImportTransactionsService();

    // Trying to maintain the dependecy inversion pattern
    const transactions = await importTransaction.execute({
      filename,
      createTransaction,
    });

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
