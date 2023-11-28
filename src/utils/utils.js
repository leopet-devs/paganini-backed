import crypto from 'crypto';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { CODE_EXP_TIME, PRIV_KEY_PATH, TOKEN_SECRET } from '../config/index.js';
import redis from '../database/redis.js';
import CodeModel from '../models/code.js';

export const decrypt = (string, encryptionMethod) => {
	const privateKeyPem = fs.readFileSync(path.resolve(PRIV_KEY_PATH), 'utf8');
	let privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

	let encryptedData = forge.util.decode64(string);

	let decryptedData = privateKey.decrypt(encryptedData, 'RSA-OAEP');
	let decryptedDataString = decryptedData.toString();
	return decryptedDataString;
};

export const getCode = async (code, isError = true) => {
	try {
		const codeObject = await CodeModel.findOne({ code: code }).exec();

		return {
			error: isError,
			reason: codeObject.reason,
			description: codeObject.description,
		};
	} catch (error) {
		return {
			error: isError,
			reason: 'INTERNAL_ERROR',
			description: 'Error interno del sistema',
		};
	}
};

export const getClientFromToken = (token) => {
	try {
		const decoded = jwt.decode(token, TOKEN_SECRET);
		return decoded.id;
	} catch (error) {
		console.error('Utils: getClientFromToken', error);
		return null;
	}
};

export const generateVerificationCode = async (id) => {
	let code;

	try {
		code = crypto.randomInt(100000, 999999);
		await redis.set(id, code.toString(), {
			EX: 60,
			NX: true,
		});
	} catch (error) {
		console.error(error);
		console.log('Error en la generacion del código');
		code = 123456;
	}

	return code;
};

export const getVerificationCode = async (id) => {
	let code;
	try {
		code = await redis.get(id);
	} catch (error) {
		console.error(error);
		console.log('No se encuentra el codigo para este host');
		code = 123456;
	}
	return code;
};
