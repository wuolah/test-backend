const AWS = require( "aws-sdk" );
const { v4 } = require( "uuid" );
const bcrypt = require( 'bcrypt' );
const handleError = require( '../utils/handleError' );

const USERS_TABLE = process.env.USERS_TABLE;
const TRIGGER_FILE = 'usersRepository';
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const getByEmail = async ( email ) => {
    const params = {
        TableName: USERS_TABLE,
        IndexName: 'emailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    };

    try {
        const { Items } = await dynamoDbClient.query( params ).promise();

        if ( Items.length ) {
            const { userId, name, email } = Items[0];

            return { userId, name, email };
        } else {
            return false;
        }
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getByEmail', error );
        return false;
    }
};

const create = async ( email, password, name ) => {
    const createdAt = new Date().toISOString();
    const userId = v4(); // Generate a unique user id

    const newUser = {
        userId,
        email,
        hash: bcrypt.hashSync( password, 8 ), // Added simple crypt to protect password information
        name,
        createdAt,
    }

    const params = {
        TableName: USERS_TABLE,
        Item: newUser,
    };

    try {
        await dynamoDbClient.put( params ).promise();
        return {
            userId,
            email,
            name,
            createdAt
        };
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'create', error );
        return false;
    }
};

module.exports = {
    getByEmail,
    create
};