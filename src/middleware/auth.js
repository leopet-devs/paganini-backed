import jwt from 'jsonwebtoken';
import { getCode } from '../utils/utils.js';
import { TOKEN_SECRET } from '../config/index.js';

// TODO: Buscar mejor forma para comprobar que el token sea correcto. Guardar el token en la base de datos??
// Sistema para la autorizacion??
const authorization = async (req, res, next) => {

  try {

    const { authorization } = req.headers;
    if (!authorization) throw new Error("No se encontro el header de autorización");

    const [tokenType, token] = authorization.split(' ');
    if (!token || tokenType != 'Bearer') throw new Error("Token o tipo de token incorrectos");

    try {

      // TODO: Guardar los tokens en la base de datos???
      const decodeClient = jwt.verify(token, TOKEN_SECRET);
      console.log("middleware ", decodeClient);

    } catch (err) {

      console.error(err);
      const response = await getCode('0011');
      return res.status(400).json(response);

    }

    next();

  } catch (error) {

    console.error(error);
    const response = await getCode('0010');
    return res.status(400).json(response);

  }

}

export default authorization;
