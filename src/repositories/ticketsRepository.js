const AWS = require( "aws-sdk" );
const { v4 } = require( "uuid" );
const handleError = require( "../utils/handleError" );

const TICKETS_TABLE = process.env.TICKETS_TABLE;
const TRIGGER_FILE = 'ticketsRepository';
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const getAll = async () => {
    const params = {
        TableName: TICKETS_TABLE,
    };

    try {
        const { Items } = await dynamoDbClient.scan( params ).promise();

        return Items;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getAll', error );
        return false;
    }
};

const getByUserId = async ( userId ) => {
    const params = {
        TableName: TICKETS_TABLE,
        IndexName: 'userIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
        },
    };

    try {
        const { Items } = await dynamoDbClient.query( params ).promise();

        return Items || false;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getByUserId', error );
        return false;
    }
};

const getByUserIdAndAvailability = async ( userId, availability ) => {
    const params = {
        TableName: TICKETS_TABLE,
        IndexName: 'userIdIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'available = :availability',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':availability': availability,
        },
    };

    try {
        const { Items } = await dynamoDbClient.query( params ).promise();

        return Items || false;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getByUserIdAndAvailability', error );
        return false;
    }
};

const getByUserIdAndContest = async ( userId, contest ) => {
    const params = {
        TableName: TICKETS_TABLE,
        IndexName: 'userIdIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'contestId = :contestId and available = :available',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':contestId': contest,
            ':available': false,
        },
    };

    try {
        const { Items } = await dynamoDbClient.query( params ).promise();

        return Items || false;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getByUserIdAndContest', error );
        return false;
    }
};

const getByContestId = async ( contestId ) => {
    const params = {
        TableName: TICKETS_TABLE,
        FilterExpression: 'contestId = :contestId',
        ExpressionAttributeValues: {
            ':contestId': contestId,
        },
    };

    try {
        const { Items } = await dynamoDbClient.scan( params ).promise();

        return Items || false;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'getByContestId', error );
        return false;
    }
};

const create = async ( { userId, login } ) => {
    const createdAt = new Date().toISOString();
    const ticketId = v4(); // Generate a unique ticket id

    const newTicket = {
        ticketId,
        contestId: null,
        userId,
        userLogin: login,
        available: true,
        createdAt,
    };

    const params = {
        TableName: TICKETS_TABLE,
        Item: newTicket,
    };

    try {
        await dynamoDbClient.put( params ).promise();
        return newTicket;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'create', error );
        return false;
    }
};

const addToContest = async ( ticketId, contestId ) => {
    const params = {
        TableName: TICKETS_TABLE,
        Key: {
            ticketId,
        },
        UpdateExpression: 'SET contestId = :contestId, available = :available',
        ExpressionAttributeValues: {
            ':contestId': contestId,
            ':available': false,
        },
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const { Attributes } = await dynamoDbClient.update( params ).promise();

        return Attributes || false;
    } catch ( error ) {
        handleError( TRIGGER_FILE, 'addToContest', error );
        return false;
    }
};

module.exports = {
    getAll,
    getByUserId,
    getByUserIdAndAvailability,
    getByUserIdAndContest,
    getByContestId,
    create,
    addToContest,
};