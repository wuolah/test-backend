const AWS = require( 'aws-sdk' );
const { v4 } = require( 'uuid' );
const contestsController = require( '../../controllers/contests' );
const contestsRepository = require( '../../repositories/contestsRepository' );
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
    },
    scan: {
        promise: jest.fn()
    }
};

jest.useFakeTimers( 'modern' );
jest.setSystemTime( new Date( 2022, 6, 13 ) );

let contestResponseProvider = {
    contestId: '123',
    name: 'Concurso de testing',
    description: 'Usar jest como un pro',
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
                    put: () => mockDocumentClient.put,
                    scan: () => mockDocumentClient.scan
                };
            } ),
        },
    };
} );

jest.mock( 'uuid' );

describe( 'Contests controller', () => {
    it( 'should return a contest by providing an id', async () => {
        const req = mockRequest( { params: { id: 'asdasdasds' } } );
        const res = mockResponse();

        mockDocumentClient.get.promise.mockReturnValue( { Item: contestResponseProvider } );

        await contestsController.getContestById( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: true, contest: contestResponseProvider } );
    } );

    it( 'should return an error on when provided id does not exist', async () => {
        const req = mockRequest( { params: { id: 'asdasdasds' } } );
        const res = mockResponse();

        mockDocumentClient.get.promise.mockReturnValue( false );

        await contestsController.getContestById( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'Could not find contest with provided id' } );
    } );

    it( 'should return a list of contests', async () => {
        const req = mockRequest( { params: {} } );
        const res = mockResponse();

        mockDocumentClient.scan.promise.mockReturnValue( { Items: [contestResponseProvider] } );

        await contestsController.getAllContests( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: true, contests: [contestResponseProvider] } );
    } );

    it( 'should return an error when contests is empty', async () => {
        const req = mockRequest( { params: {} } );
        const res = mockResponse();

        mockDocumentClient.scan.promise.mockReturnValue( { Items: [] } );

        await contestsController.getAllContests( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'Could not find any contests' } );
    } );

    it( 'should create a contest', async () => {
        const req = mockRequest( { body: { name: 'Concurso de testing', description: 'Usar jest como un pro' } } );
        const res = mockResponse();

        v4.mockImplementation( () => '123' );

        mockDocumentClient.put.promise.mockReturnValue( { Item: contestResponseProvider } );

        await contestsController.createContest( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: true, contest: contestResponseProvider } );
    } );

    it( 'should return an error when contest is not created', async () => {
        const req = mockRequest( { body: { name: 'Concurso de testing', description: 'Usar jest como un pro' } } );
        const res = mockResponse();

        v4.mockImplementation( () => '123' );

        contestsRepository.create = jest.fn().mockReturnValueOnce( false );

        await contestsController.createContest( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'Could not create contest' } );
    } );

    it( 'should return an error when some fields are missing on create contest', async () => {
        const req = mockRequest( { body: { name: 'Concurso de testing' } } );
        const res = mockResponse();

        v4.mockImplementation( () => '123' );

        await contestsController.createContest( req, res );

        expect( res.json ).toHaveBeenCalledWith( { success: false, error: 'Some fields missing, check contest info and register again' } );
    } )
} );