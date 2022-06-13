const AWS = require( 'aws-sdk' );
const { v4 } = require( 'uuid' );
const userController = require( '../../controllers/users' );
const usersRepository = require( '../../repositories/usersRepository' );
const { mockRequest, mockResponse } = require( '../mocks/express' );

let mockDocumentClient = {
    get: {
        promise: jest.fn()
    },
    query: {
        promise: jest.fn()
    },
    transactWrite: {
        promise: jest.fn()
    },
    put: {
        promise: jest.fn()
    }
};

jest.useFakeTimers( 'modern' );
jest.setSystemTime( new Date( 2022, 6, 13 ) );

let userParamProvider = {
    email: 'john@doe.com',
    password: '123456',
    name: 'John Doe',
    login: 'johndoe'
};

let userResponseProvider = {
    userId: '123',
    name: 'John Doe',
    email: 'john@doe.com',
    login: 'johndoe',
    createdAt: new Date( Date.now() ).toISOString()
}

jest.mock( "aws-sdk", () => {
    return {
        DynamoDB: {
            DocumentClient: jest.fn().mockImplementation( () => {
                return {
                    get: () => mockDocumentClient.get,
                    query: () => mockDocumentClient.query,
                    transactWrite: () => mockDocumentClient.transactWrite,
                    put: () => mockDocumentClient.put
                };
            } ),
        },
    };
} );
jest.mock( 'uuid' );

describe( 'Users controller', () => {
    it( 'should return a user by providing an email or username', async () => {
        const req = mockRequest( { params: { emailLogin: 'johndoe' } } );
        const res = mockResponse();

        const mockedUser = {
            userId: '123',
            name: 'John Doe',
            email: 'john@doe.com',
            login: 'johndoe'
        };

        mockDocumentClient.query.promise.mockReturnValueOnce( { Items: [mockedUser] } );

        await userController.getUserByEmailOrLogin( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: true, user: mockedUser } );
    } );

    it( 'should return an error when provide bad username or email', async () => {
        const req = mockRequest( { params: { emailLogin: 'johndoe' } } );
        const res = mockResponse();

        mockDocumentClient.query.promise.mockReturnValue( { Items: false } );

        await userController.getUserByEmailOrLogin( req, res );

        expect( res.status ).toHaveBeenCalledWith( 404 );
        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'Could not find user with provided "email" or "login"' } );
    } )

    it( 'should return a new user', async () => {
        const req = mockRequest( { body: userParamProvider } );
        const res = mockResponse();

        v4.mockImplementation( () => '123' );

        mockDocumentClient.put.promise.mockReturnValueOnce( {
            Item: {
                ...userResponseProvider
            }
        } );

        await userController.createUser( req, res );

        expect( res.json ).toHaveBeenCalledWith( {
            success: true, user: {
                ...userResponseProvider
            }
        } );
    } );

    it( 'should return an error when creating a new user', async () => {
        const req = mockRequest( {
            body: {
                email: 'john@doe.com',
            }
        } );

        const res = mockResponse();

        await userController.createUser( req, res );

        expect( res.status ).toHaveBeenCalledWith( 400 );

        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'Some fields missing, check your info and sign up again' } );
    } );

    it( 'should return an error on create user when user by email exists', async () => {
        const req = mockRequest( { body: userParamProvider } );

        const res = mockResponse();

        usersRepository.getByEmail = jest.fn().mockReturnValueOnce( {
            Item: {
                userResponseProvider
            }
        } );

        await userController.createUser( req, res );

        expect( res.status ).toHaveBeenCalledWith( 400 );
        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'User with provided email already exists' } );
    } );

    it( 'should return an error on create user when user by login exists', async () => {
        const req = mockRequest( { body: userParamProvider } );

        const res = mockResponse();

        usersRepository.getByLogin = jest.fn().mockReturnValueOnce( {
            Item: {
                ...userResponseProvider
            }
        } );

        await userController.createUser( req, res );

        expect( res.status ).toHaveBeenCalledWith( 400 );
        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'User with provided login already exists' } );
    } );

    it( 'should return an error on create user fails', async () => {
        const req = mockRequest( { body: userParamProvider } );
        const res = mockResponse();

        v4.mockImplementation( () => '123' );

        usersRepository.create = jest.fn().mockReturnValueOnce( false );

        await userController.createUser( req, res );

        expect( res.json ).toHaveBeenCalledWith( {
            success: false, error: 'Could not create user'
        } );
    } );
} );