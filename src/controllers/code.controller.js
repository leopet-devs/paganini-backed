import CodeModel from '../models/code.js';

// Solo para este caso, modificar para una rest api
export const createCodes = async (req, res) => {

  try{

    const codes_list = req.body.data;

    for( var i=0; i<codes_list.length; i++ ){
      const newCode = new CodeModel(codes_list[i]);
      await newCode.save();
    }

    return res.status(201).send("Códigos creados con éxito");

  }catch(error){

    console.error(error);
    return res.sendStatus(400);

  }

}

export const createCode = (req, res) => {

  console.log(req);
  return res.sendStatus(400);

}
