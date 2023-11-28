# paganini-backed

Descripción corta del proyecto.

## Requisitos

Asegúrate de tener instaladas las siguientes dependencias antes de ejecutar la aplicación:

```bash
$ npm i express body-parser mongoose bcrypt dotenv jsonwebtoken cors @hapi/joi
$ npm i -g nodemon
```

## Ejecución

```bash
$ ./npm run dev
```

## Instrucciones
Probar en Postman. Las contraseñas debe ser min de 6 caracteres.
Comprobar permisos con el esquema GET: /api/permiso.

```bash
Headers/
KEY: auth-token VALUE:<tokensecret>
```
