import { Router } from 'express';

// import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import ListTransactionsService from '../services/ListTransactionsService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

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

// transactionsRouter.delete('/:id', async (request, response) => {
//  // TODO
// });
//
// transactionsRouter.post('/import', async (request, response) => {
//  // TODO
// });

export default transactionsRouter;
