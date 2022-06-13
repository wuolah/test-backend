# Inicialización del proyecto

* Ir a **AWS Console** y crear un usuario con **IAM** (permisos Administrator para la demo)
    * Autenticarte en tu sesión local con `aws configure` usando las claves del usuario que acabamos de crear
* Instalar serverless de forma local: `sudo npm install -g serverless`
* Instalar dependencias del proyecto con `npm install`
* Con esto, podremos ejecutar el comando `serverless deploy` para tener la función lambda en nuestra cuenta de AWS