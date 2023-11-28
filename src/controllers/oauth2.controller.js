import AppModel from '../models/application.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getCode } from '../utils/utils.js';
import { TOKEN_SECRET, EXPIRE_TIME } from '../config/index.js';
import { clientTokenVerify, saveToken } from './token.controller.js';
import twilioClient from '../config/twilio.js';

export const generateToken = async (req, res) => {
  //
  try {

    const { authorization } = req.headers;
    if (!authorization) {
      let error = new Error("No se encontro el header de autorización");
      error.name = "Auth Header";
      throw error;
    }

    const { grant_type } = req.body;
    if (!grant_type || grant_type != "client_credentials") {
      let error = new Error("Error en los permisos del cliente");
      error.name = "Grant Type";
      throw error;
    }

    const [tokenType, token] = authorization.split(' ');
    if (!token || tokenType != 'Basic') {
      let error = new Error("Token o tipo de token incorrectos");
      error.name = "Client";
      throw error;
    }

    const [client_id, client_secret] = atob(token).split(":");

    const client = await AppModel.findOne({ appID: client_id }).exec();
    if (!client) {
      let error = new Error("El cliente(app) no existe");
      error.name = "Client";
      throw error;
    }

    const secretMatch = await bcrypt.compare(client_secret, client.appSecret);
    if (!secretMatch) {
      let error = new Error("El client_secret no corresponse al cliente");
      error.name = "Client";
      throw error;
    }

    // Verificar si el token esta en la base
    const tokenVerify = await clientTokenVerify(client_id);
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
    });

    return res.status(200).json(payload);

  } catch (error) {

    console.log(error);
    // TODO: Cambiar el codigo de los errores
    res.status(400);
    let response = {};

    if (error.name == "Client") {

      response = await getCode("0061");
      return res.json(response);

    } else if (error.name == "Grant Type") {

      response = await getCode("0070");
      return res.json(response);

    } else if (error.name == "Auth Header") {

      response = await getCode("0060");
      return res.json(response);

    }

    response = await getCode('0010');
    return res.json(response);

  }

}
