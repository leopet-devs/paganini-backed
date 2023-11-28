import {
  decrypt,
  generateVerificationCode,
  getClientFromToken,
  getCode,
  getVerificationCode,
} from '../utils/utils.js';

import {
  createTransaction,
  getTransactionByID,
  getTransactionClientName,
  updateTransactionStatusByID,
} from '../controllers/transaction.controller.js';

import bcrypt from 'bcrypt';
import gateway from '../config/braintree.js';
import { TWILIO_NUMBER } from '../config/index.js';
import twilioClient from '../config/twilio.js';
import AppModel from '../models/application.js';

export const startTransaction = async (req, res) => {
	// EL CUERPO DE LA REQUEST DEBE TENER EL ORDEN ID
	const body = req.body;
	const id = getClientFromToken(req.headers.authorization.split(' ')[1]);
	let newCustomer;
	let transaction = {
		orderID: body.orderID,
		amount: body.amount,
		appID: id,
		clientName: body.clientName,
	};

	try {
		// Creacion de customer para almacenar el metodo de pago
		newCustomer = await gateway.customer.create({});

		// ERRORES: TARJETA INVALIDA, CVV INVALIDO, FRAUDE DETECTADO
		// Crear el metodo de pago para el customer
		const newCard = await gateway.creditCard.create({
			customerId: newCustomer.customer.id,
			...body.cardData.data,
			options: {
				//failOnDuplicatePaymentMethod: true, Evitar un error no mapeado
				makeDefault: true,
				verifyCard: true,
			},
		});
		if (!newCard.success) {
			console.log(newCard.message);
			const status = newCard.verification.status;
			let response = {};

			if (status == 'gateway_rejected') {
				const reason = newCard.verification.gatewayRejectionReason;
				switch (reason) {
					case 'cvv':
						response = await getCode('0024');
						transaction.code = '0024';
						console.error('Error en el CVV');
						break;
					case 'fraud':
						response = await getCode('0021');
						transaction.code = '0021';
						console.error('Fraude detectado');
						break;
					default:
						response = await getCode('0026');
						transaction.code = '0026';
						console.error('Error de transaccion');
						break;
				}
			} else if (status == 'processor_declined') {
				const processorCode = newCard.verification.processorResponseCode;

				switch (processorCode) {
					case '2000':
						response = await getCode('0020');
						transaction.code = '0020';
						console.error('Tarjeta invalida');
						break;
					default:
						response = await getCode('0026');
						transaction.code = '0026';
						console.error('Error de transaccion');
						break;
				}
			}

			await createTransaction(transaction);
			await gateway.customer.delete(newCustomer.customer.id);
			return res.status(400).json(response);
		}

		transaction.code = '0090';
		const transactionCreated = await createTransaction(transaction);
		if (!transactionCreated) {
			let error = new Error('Error al crear la transaccion');
			error.name = 'TransactionError';
			throw error;
		}

		// Esto genera el codigo de verficacion y lo guarda en redis
		const verificationCode = await generateVerificationCode(req.hostname);
		const name = 'Paganini';
		// const message = await twilioClient.messages.create({
		//   body: `El código de verificación para ${name} es: ${verificationCode}`,
		//   from: TWILIO_NUMBER,
		//   to: body.clientNumber
		// });

		return res.status(201).json({
			transactionID: transactionCreated.transactionID,
			paymentID: newCustomer.customer.id,
			verificationCode: verificationCode,
			error: false,
		});
	} catch (error) {
		console.error(error);

		if (newCustomer.customer.id)
			await gateway.customer.delete(newCustomer.customer.id);

		if (error.name == 'TypeError') {
			const response = await getCode('0080');
			return res.status(400).json(response);
		} else {
			const response = await getCode('xxxx');
			return res.status(500).json(response);
		}
	}
};

export const settleTransaction = async (req, res) => {
	const body = req.body;
	let transaction;

	// VERIFICAR SI EXISTE EL CUSTOMER
	try {
		const customer = await gateway.customer.find(body.paymentID);
	} catch (error) {
		console.error(error);
		console('Customer no encontrado');

		const response = await getCode('0025');
		await updateTransactionStatusByID(transaction.transactionID, '0025');
		return res.status(400).json(response);
	}

	// VERIFICAR SI EXISTE LA TRANSACCION
	try {
		transaction = await getTransactionByID(body.transactionID);
	} catch (error) {
		console.error(error);
		console('Transaction no encontrada');

		const response = await getCode('0025');
		await updateTransactionStatusByID(transaction.transactionID, '0025');
		await gateway.customer.delete(body.paymentID);
		return res.status(400).json(response);
	}

	// Sacar el codigo desde redis
	const code = body.verificationCode;
	const codeFromRedis = await getVerificationCode(req.hostname);

  console.log("body code", code);
  console.log("redis code", codeFromRedis);

  console.log("body code type", typeof code);
  console.log("redis code type", typeof codeFromRedis)

	if (code != codeFromRedis) {
		const response = await getCode('0050');
		await updateTransactionStatusByID(transaction.transactionID, '0050');
		await gateway.customer.delete(body.paymentID);
		console.error('Error en la verificacion del codigo enviado al customer');
		return res.status(400).json(response);
	}

	// Crear la nueva transaccion en braintree
	const newSale = await gateway.transaction.sale({
		customerId: body.paymentID,
		amount: transaction.amount,
	});

	console.log(newSale.message);

	if (!newSale.success) {
		let response = {};

		try {
			const status = newSale.transaction.status;
			const responseCode = newSale.transaction.processorResponseCode;

			if (status == 'processor_declined' && responseCode == '2001') {
				response = await getCode('0023');
				await updateTransactionStatusByID(transaction.transactionID, '0023');
				console.log('Fondos insuficientes');
			} else {
				const err = new Error('Error indefinido en la transacción');
				err.name = 'Transaction Error';
				throw err;
			}
		} catch (error) {
			console.error(error);

			response = await getCode('0025');
			await updateTransactionStatusByID(transaction.transactionID, '0025');
			console.log('Error en la transaccion');
		}

		// TODO: Crear la transaccion con el estatus presentados anteriormente
		await gateway.customer.delete(body.paymentID);
		return res.status(400).json(response);
	}

	await gateway.customer.delete(body.paymentID);
	const response = await getCode('0000', false);
	await updateTransactionStatusByID(transaction.transactionID, '0000');

	return res.status(201).json({ ...transaction, ...response });
};

export const destroyTransaction = async (req, res) => {
	const body = req.body;

	try {
		await gateway.customer.delete(body.paymentID);
		await updateTransactionStatusByID(body.transactionID, '0040');

		// PARA TESTING
		console.log('Destroy transaction: Borrado el customer', body.paymentID);
		console.log(
			'Destroy transaction: Borrada la transaccion',
			body.transactionID
		);

		const response = await getCode('0040');
		return res.status(400).json(response);
	} catch (error) {
		// PARA TESING
		console.log('Destroy transaction: Customer o transaccion no encontrada');
		console.error(error);

		const response = await getCode('0025');
		return res.status(400).json(response);
	}
};

export const consultTransaction = async (req, res) => {
	try {
		const { authorization } = req.headers;
		if (!authorization) {
			let error = new Error('No se encontro el header de autorización');
			error.name = 'Auth Header';
			throw error;
		}

		/*const { grant_type } = req.body;
    if (!grant_type || grant_type != "client_credentials") {
      let error = new Error("Error en los permisos del cliente");
      error.name = "Grant Type";
      throw error;
    }*/

		const [tokenType, token] = authorization.split(' ');
		if (!token || tokenType != 'Basic') {
			let error = new Error('Token o tipo de token incorrectos');
			error.name = 'Client';
			throw error;
		}

		const [client_id, client_secret] = atob(token).split(':');

		const client = await AppModel.findOne({ appID: client_id }).exec();
		if (!client) {
			let error = new Error('El cliente(app) no existe');
			error.name = 'Client';
			throw error;
		}

		const secretMatch = await bcrypt.compare(client_secret, client.appSecret);
		if (!secretMatch) {
			let error = new Error('El client_secret no corresponse al cliente');
			error.name = 'Client';
			throw error;
		}

		const response = await getTransactionClientName(client_id, req.body.id);
		return res.status(201).json(response);

		// Verificar si el token esta en la base
		/*const tokenVerify = await clientTokenVerify(client_id);
    if (tokenVerify.exists) {
      delete tokenVerify.exists;
      return res.status(200).json(tokenVerify);
    }

    const access_token = jwt.sign({
      id: client_id,
      secret: client_secret
    }, TOKEN_SECRET, { expiresIn: EXPIRE_TIME });


    const payload = await saveToken({
      token: access_token,
      lifetime: EXPIRE_TIME,
      iat: Math.floor(Date.now() / 1000),
      appID: client_id
    });*/

		//return res.status(200).json(payload);
	} catch (error) {
		console.log(error);
		// TODO: Cambiar el codigo de los errores
		res.status(400);
		let response = {};

		if (error.name == 'Client') {
			response = await getCode('0061');
			return res.json(response);

			/*} else if (error.name == "Grant Type") {

      response = await getCode("0070");
      return res.json(response);*/
		} else if (error.name == 'Auth Header') {
			response = await getCode('0060');
			return res.json(response);
		}

		response = await getCode('0025');
		return res.status(400).json(response);
	}

	/*const body = req.body;

  try {

    const response = await getTransactionClientName(body.id);
    return res.status(201).json(response);

  } catch (error) {

    console.log("Error");
    console.error(error);

    const response = await getCode('0025');
    return res.status(400).json(response);

  }*/
};
