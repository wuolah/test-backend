const AWS = require( "aws-sdk" );
const { v4 } = require( "uuid" );
const handleError = require( "../utils/handleError" );

const CONTESTS_TABLE = process.env.CONTESTS_TABLE;
const TRIGGER_FILE = 'contestsRepository';
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const getAll = async () => {
    const params = {
        TableName: CONTESTS_TABLE,
    };

    try {
        const { Items } = await dynamoDbClient.scan( params ).promise();

        return Items;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getAll', error );
        return false;
    }
};

const getById = async ( id ) => {
    const params = {
        TableName: CONTESTS_TABLE,
        Key: {
            contestId: id,
        },
    };

    try {
        const { Item } = await dynamoDbClient.get( params ).promise();

        return Item || false;
    }
    catch ( error ) {
        handleError( TRIGGER_FILE, 'getById', error );
        return false;
    }
};

const create = async ( name, description ) => {
    const createdAt = new Date().toISOString();
    const contestId = v4(); // Generate a unique contest id

    const newContest = {
        contestId,
        name,
        description,
        createdAt,
    }

    const params = {
        TableName: CONTESTS_TABLE,
        Item: newContest,
    };

    try {
        await dynamoDbClient.put( params ).promise();
        return {
            contestId,
            name,
            description,
            createdAt
        };
    }
    catch ( error ) {
        handleError( TRIGGER_FILE, 'create', error );
        return false;
    }
};

module.exports = {
    getAll,
    getById,
    create,
};