# paganini-backed

Requisitos
~$ ./npm i express body-parser mongoose bcrypt dotenv jsonwebtoken cors @hapi/joi
~$ ./npm i -g nodemon

Ejecución
$ ./npm run dev

Instrucciones
Probar en Postman. Las contraseñas debe ser min de 6 caracteres.
Comprobar permisos con el esquema GET: /api/permiso.
Headers/
KEY: auth-token VALUE:<tokensecret>
