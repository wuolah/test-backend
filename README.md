# Notas de Manu

* Sobre el punto de dejar comentarios sobre el propio código, he preferido no ponerlo en práctica durante el ejercicio. Mi punto de vista es que la declaración tanto de métodos como de variables debe ser lo suficientemente claro para que en sí mismo sirva de documentación.

## Bonus

* Paso a explicar cómo implementaría que un usuario obtenga un ticket de forma semanal.
    * Se puede hacer de varias formas, pero la más sencilla sería tener una clave en la entidad "`users`" tipo "`lastIssuedTicket`" con la fecha de la última vez que recibió el ticket semanal. Con una simple función, se podría obtener la diferencia de días entre la fecha almacenada y la actual durante el proceso de login, otorgando un ticket semanal. Si se quisiera hacer por semana "pura", podríamos obtener si los días a comparar pertenecen a la misma semana del mismo mes y año, si ha pasado la semana, se sumaría el ticket. Por ejemplo, la librería `date-fns` tiene un método llamado `isSameWeek` para este propósito. Obviamente, el campo "lastIssuedTicket" se debe actualizar una vez otorgado el ticket al usuario.

## Implementación cloud-native

* Finalmente opté por utilizar `AWS Lambda` junto a `Serverless` para realizar el ejercicio. Como base de datos he utilizado `DynamoDB`.
* En cuanto a logging y monitorización he estado utilizando `CloudWatch` junto a un utils en código para tener un formato de los mensajes de error, así podía localizar de forma rápida qué fichero y método lanzaban la excepción. Aunque serverless te permite monitorizar la aplicación, para este ejercicio veía suficiente `CloudWatch`.
* En cuanto a gestión de errores, no he llegado a profundizar en ello.

## Testing

* Para realizar los tests unitarios del ejercicio, he utilizado `jest`.
* No he realizado tests de integración.
* No he añadido toda la cobertura de tests. Quise cubrir al menos una parte de los controladores para mostrar cómo suelo proceder a realizarlos.

## DEMO

* La función lambda está publicada en el siguiente enlace: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/

A continuación, paso a explicar los endpoint desarrollados y cómo interactuar con ellos.

### **[GET] /users/{emailLogin} - Obtener Usuario**
```
Se obtiene el usuario con el email / login indicado. Si no existe, se devuelve un error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/users/manurgdev
```

### **[POST] /users - Crear usuario**
```
Se crea un usuario con los datos indicados. Si ya existe, se devuelve un error. Si faltan campos necesarios, se devuelve error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/users

body:
 {
    "email": "pepe@pepe.com",
    "password": "123456",
    "name": "Pepe Pérez",
    "login": "pepe"
 }
```

### **[GET] /contests - Obtener lista de concursos**
```
Se obtiene la lista de todos los concursos. Si no existen concursos, se devuelve un error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/contests
```

### **[GET] /contests/{id} - Obtener concurso por id**
```
Se obtiene el concurso con el id indicado. Si no existe, se devuelve un error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/contests/3f87f50e-1616-4765-98c5-76014c8e494c
```

### **[GET] /contests/{id}/participants - Obtener listado de participantes de un concurso**
```
Se obtiene el listado de participantes de un concurso. Si no existen participantes, se devuelve un error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/contests/3f87f50e-1616-4765-98c5-76014c8e494c/participants
```

### **[POST] /contests - Crear concurso**
```
Se crea un concurso con los datos indicados. Si ya existe, se devuelve un error. Si faltan campos necesarios, se devuelve error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/contests

body:
{
    "name": "Concurso de prueba",
    "description": "Concurso de prueba para probar el funcionamiento de la API"
}
```

### **[GET] /tickets - Obtener listado de tickets**
```
Se obtiene el listado de todos los tickets. Si no existen tickets, se devuelve un error. Este endpoint existe por debug, ya que no sería necesaria su implementación en un entorno real.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets
```

### **[GET] /tickets/user/{userInfo} - Obtener listado de tickets de un usuario**
```
Se obtiene el listado de todos los tickets de un usuario. Si no existen tickets, se devuelve un error. También permite filtrar por estado (canjeado o disponible). También permite filtrar por concurso.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets/user/manurgdev

Ejemplo buscando usuario por email: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets/user/manurgdev@gmail.com

Ejemplo con filtro ticket disponible: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets/user/manurgdev?available=1

Ejemplo con filtro ticket canjeado: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets/user/manurgdev?available=0

Ejemplo con filtro por id de concurso: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets/user/manurgdev?contest=3f87f50e-1616-4765-98c5-76014c8e494c
```

### **[POST] /tickets/redeem - Canjear ticket ya existente para un usuario y concurso**
```
Se canjea un ticket existente. Si no existe, se devuelve un error. Si el usuario no tiene más tickets disponibles, se devuelve un error.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets/redeem

body:
{
    "userInfo": "manurgdev", // También puede ser el email
    "contestId": "3f87f50e-1616-4765-98c5-76014c8e494c"
}
```

### **[POST] /tickets - Crear ticket**
```
Se crea un ticket nuevo al usuario. Si no existe el usuario, se devuelve error. El ticket no estará asociado a un concurso y su estado será dispnible. Este endpoint está disponible para pruebas, ya que en el entorno real sería un proceso interno de la aplicación. Por ejemplo, se lanzaría cuando el usuario acceda a la aplicación una vez por semana.

Ejemplo: https://7qfmzdyw27.execute-api.eu-west-3.amazonaws.com/tickets

body:
{
    "userLogin": "manurgdev" //En este caso se filtra por login del usuario directamente.
}
```

## Cómo trabajar con la aplicación

He preparado el documento `INSTALL.md` con las pocas configuraciones necesarias para poder lanzar la aplicación a AWS sin mayor problema.

# Prueba técnica backend

## Introducción

Bienvenid@ a la prueba de técnica de Wuolah para desarrolladores backend

Queremos ver cómo te desenvuelves ante un caso práctico que simula los retos a los que nos enfrentamos a diario

## ¿Qué buscamos evaluar?


- Capacidad de **entender los requisitos y buscar soluciones**
- Capacidad de comunicación a la hora de plantear posibles dudas y/o decisiones
- Familiaridad o capacidad de adaptación al stack planteado
- **Buen uso** de Node.js y buenas prácticas en el **diseño de APIs**
- **Principios** aplicados en el desarrollo de código, prestando especial atención en:
    - **Idempotencia**: debemos ser capaces de ejecutar nuestro código con cualquier dato que siga el formato y obtener siempre los mismos resultados para la misma entrada, independientemente del entorno en el que sea ejecutado.
    - **Testeabilidad**: ¿cómo garantizas que tu código funciona? Proveer tests es otra tarea importante que a menudo olvidamos o no priorizamos.
    - **Rendimiento**: tendemos a pensar que la velocidad no es tan importante, pero cambia la forma en la que nuestros usuarios hacen o perciben las cosas. Y por último, piensa en la escalabilidad del sistema que estas desarrollando, ¿qué ocurre si el código recibe cientos de peticiones por segundo? ¿identificas algún cuello de botella?

## Prueba


### Requisitos básicos

Vamos a construir una aplicación de concursos. Para ello, construiremos una API RESTful que de solución a las siguientes historias de usuario:

- Como usuario me gustaría visualizar un listado de concursos disponibles.
- Como usuario me gustaría obtener los detalles de un concurso determinado.
- Como usuario me gustaría ser capaz de canjear mis tickets por participaciones en un concurso, pudiendo canjear un número ilimitado de tickets en un mismo concurso.
- Como usuario me gustaría ver mis tickets, siendo capaz de filtrar por estado del ticket (canjeado o disponible) y por id de concurso, en caso de ticket canjeado.
- Como usuario me gustaría ver un listado de usuarios que han participado en un determinado concurso.

### Bonus

- El sistema debe otorgar un ticket a todo usuario que realice un acceso a la plataforma cada semana. Nos gustaría conocer tu opinión sobre cómo realizarías dicho procesamiento, explicándolo de forma teórica, **no hace falta implementación**.
- Escribe documentación clara sobre cómo está diseñada la solución y cómo ejecutar el código.
- Escribe buenos comentarios in-line (sobre el propio código).
- Escribe mensajes descriptivos en los commits.
- Un demo online es siempre bienvenida :)

## Instrucciones


- Para iniciar la prueba, haz un fork de [este repositorio](https://github.com/wuolah/test-backend), crea una rama con tu nombre completo y luego realiza una Pull Request cuando esté todo listo para ser revisado.
- Existen **dos opciones de implementación**, elige la que prefieras.
    - **No cloud-native**
    - **Cloud-native (AWS)**
- Evita realizar un único commit y mantén un histórico que nos permita saber cómo has ido llegando a la solución final.
- Puedes usar cualquier biblioteca que usarías normalmente si se tratara de una aplicación real. Pero ten en cuenta que **estamos interesados en tu código** y la forma en la que resuelves el problema, no en el expertise en una determinada biblioteca.
- No esperamos que puedas completar todas las tareas. Esta prueba es la misma que se presenta para candidatos de todos los niveles de experiencia, así que haz lo que puedas de manera natural y relajada.

### Implementación no cloud-native

- usa Node.js LTS y cualquier framework de tu elección.
- Nos gustaría que utilizaras una de las siguientes base de datos aunque se aceptan otras con justificación.
    - si prefieres relacional: MySQL
    - si prefieres no relacional: MongoDB
- (Opcional) Describe tu estrategia de logging de los endpoints.
- (Opcional) Provee una estrategia de autenticación/autorización haciendo uso de JWT.

### Implementación cloud-native

- Crea un único servicio como una AWS Lambda individual en Node.js
- Nos gustaría que utilizaras una de las siguientes base de datos aunque se aceptan otras bases de datos con justificación.
    - si prefieres relacional: AWS Aurora (versión compatible con MySQL)
    - si prefieres no relacional: DynamoDB o DocumentDB
- Usa alguna herramienta de infraestructura como código que pueda ser usada para desplegar todos los recursos a una cuenta de AWS. Por ejemplo: CloudFormation, Terraform, Serverless Framework, etc.
- Usa API Gateway para exponer AWS Lambda.
- (Opcional) Describe tu estrategia para la gestión de errores en Lambda (política de reintentos, DLQs, etc.).
- (Opcional) Describe tu cloud-native estrategia para realizar el logging y la monitorización de los endpoints.

## FAQ


**¿Cuánto tiempo tengo?**

No hay fecha límite de entrega, pero creemos que una semana es suficiente para llevar a cabo la solución.

**¿Qué pasa si tengo alguna duda?**

[Crea una issue](https://github.com/wuolah/test-backend/issues/new/choose) en el repositorio o contacta con juanlu@wuolah.com. Te responderemos lo antes posible.
