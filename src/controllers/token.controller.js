import redis from '../database/redis.js';
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config/index.js';

export const saveToken = async (data) => {

  try{

    const dataToSave = {
      "access_token": data.token,
      "iat": data.iat,
      "lifetime": data.lifetime
    }
    const createdToken = await redis.set(data.appID, JSON.stringify(dataToSave), {
      EX: data.lifetime,
      NX: true
    })

    if( createdToken != 'OK' ){

      throw new Error("No se pudo crear el token de acceso");

    }

    return {
      "access_token": data.token,
      "token_type": "Bearer",
      "expires_in": data.lifetime
    }

  }catch (error) {

    console.error("SaveToken: ", error);
    return null;

  }

}

export const clientTokenVerify = async (client_id) => {

  try{

    const token = await redis.get(client_id);

    if( !token ){

      throw new Error("No se encontro el token de acceso");

    }

    const data = JSON.parse(token);

    return {
      "exists": true,
      "access_token": data['access_token'],
      "token_type": "Bearer",
      "expires_in": data.lifetime - (Math.floor(Date.now() / 1000) - data.iat)
    }

  }catch(error){

    console.error("clientTokenVerify: ", error);

    return {
      exists: false
    };

  }

}
