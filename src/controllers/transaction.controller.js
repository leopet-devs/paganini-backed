import TransactionModel from '../models/transaction.js';
import crypto from 'crypto';

// Solo para este caso, modificar para una rest api
export const createTransaction = async (transaction) => {

  const newTransaction = new TransactionModel({ ...transaction, transactionID: crypto.randomUUID() });
  try {

    const savedTransaction = await newTransaction.save();
    return savedTransaction;

  } catch (error) {
    console.error(error);
    return null;
  }

}

export const getTransactionByID = async (id) => {

  try {

    const transaction = await TransactionModel.findOne({ transactionID: id }).exec();
    if (!transaction) throw new Error("No se encontro la transaction");

    const response = transaction._doc;

    delete response._id;
    delete response.code;
    delete response.createdAt;
    delete response.updatedAt;

    return response;

  } catch (error) {

    console.error(error);
    throw error;

  }

}

export const updateTransactionStatusByID = async (id, newCode) => {

  try {

    const updatedTransaction =
      await TransactionModel.findOneAndUpdate({ transactionID: id }, { code: newCode }).exec();

    if (!updatedTransaction) throw new Error("No se encontro la transaction a actualizar");

  } catch (error) {
    console.error(error);
  }

}

export const getTransactionClientName = async (appid, id) => {

  try {

    const transaction = await TransactionModel.findOne({ appID: appid,clientName: id }).exec();
    if (!transaction) throw new Error("No se encontro la transaction");

    const response = transaction._doc;

    delete response._id;
    //delete response.code;
    delete response.createdAt;
    //delete response.updatedAt;

    return response;

  } catch (error) {

    console.error(error);
    throw error;

  }

}
