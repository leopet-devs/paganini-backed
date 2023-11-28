import OrderModel from '../models/order.js'
import { getCode } from '../utils/utils.js';
import orderIDGenerator from 'order-id';

export const createOrder = async ( req, res) => {

  const orderID = orderIDGenerator('key').generate();
  const newOrder = await OrderModel({ ...req.body, orderID: orderID });

  try{

    await newOrder.save();
    return res.status(201).json({ error: false, descripcion: "Orden creada con éxito", data: { orderID } });

  }catch(error){

    console.error(error);
    const rsp = await getCode('0200');
    res.status(400).json(rsp);

  }

}
