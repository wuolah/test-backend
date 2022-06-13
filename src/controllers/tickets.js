const ticketsRepository = require( '../repositories/ticketsRepository' );
const usersRepository = require( '../repositories/usersRepository' );
const contestsRepository = require( '../repositories/contestsRepository' );

const getAllTickets = async ( req, res ) => {

    const tickets = await ticketsRepository.getAll();

    if ( tickets.length ) {
        res.json( { success: true, tickets } );
        return;
    }

    res.status( 404 ).json( { success: false, error: 'Could not find any tickets' } );
};

const getTicketsByUser = async ( req, res ) => {
    const { userInfo } = req.params;

    if ( !userInfo ) {
        res.status( 400 ).json( { success: false, error: 'Missing user, please send correct information' } );
        return;
    }

    const user = await usersRepository.getByEmailOrLogin( userInfo );

    if ( !user ) {
        res.status( 404 ).json( { success: false, error: 'Could not find user with provided information' } );
        return;
    }

    const { available, contest } = req.query;

    if ( typeof contest !== 'undefined' ) {
        const tickets = await ticketsRepository.getByUserIdAndContest( user.userId, contest );

        if ( tickets.length ) {
            res.json( { success: true, tickets } );
            return;
        }

        res.status( 404 ).json( { success: false, error: 'Could not find any tickets for this user' } );
        return;
    }

    if ( typeof available !== 'undefined' ) {
        const tickets = await ticketsRepository.getByUserIdAndAvailability( user.userId, ( parseInt( available ) === 1 ? true : false ) );

        if ( tickets.length ) {
            res.json( { success: true, tickets } );
            return;
        }

        res.status( 404 ).json( {
            success: false,
            error: `Could not find any ${parseInt( available ) === 1 ? 'available' : 'redeemed'} tickets to the user provided`
        } );
        return;
    }

    const tickets = await ticketsRepository.getByUserId( user.userId );

    if ( tickets.length ) {
        res.json( { success: true, tickets } );
        return;
    }

    res.status( 404 ).json( { success: false, error: 'Could not find any tickets' } );
};

const getTicketsByContestId = async ( req, res ) => {
    const { id } = req.params;

    if ( !id ) {
        res.status( 400 ).json( { success: false, error: 'Missing contest id, please send correct information' } );
        return;
    }

    const participants = await ticketsRepository.getByContestId( id );

    if ( !participants ) {
        res.status( 404 ).json( { success: false, error: 'Could not find participants to specified contest' } );
        return;
    }

    res.json( { success: true, participants } );
};



const createTicket = async ( req, res ) => {
    const { userLogin } = req.body;

    if ( !userLogin ) {
        res.status( 400 ).json( { success: false, error: '"userLogin" field not found, please give a correct one to create ticket' } );
        return;
    }

    const user = await usersRepository.getByLogin( userLogin );

    if ( !user ) {
        res.status( 404 ).json( { success: false, error: 'Could not find user with provided id' } );
        return;
    }

    const ticket = await ticketsRepository.create( user );

    if ( ticket ) {
        res.json( { success: true, ticket } );
        return;
    }

    res.status( 500 ).json( { success: false, error: 'Could not create ticket' } );
};

const redeemTicket = async ( req, res ) => {
    const { contestId, userInfo } = req.body;

    if ( !contestId || !userInfo ) {
        res.status( 400 ).json( { success: false, error: '"contestId" or "userInfo" field not found, please give all information to redeem ticket' } );
        return;
    }

    const user = await usersRepository.getByEmailOrLogin( userInfo );

    if ( !user ) {
        res.status( 404 ).json( { success: false, error: 'Could not find user with provided information' } );
        return;
    }

    const contest = await contestsRepository.getById( contestId );

    if ( !contest ) {
        res.status( 404 ).json( { success: false, error: 'Could not find contest with provided id' } );
        return;
    }

    const availableTickets = await ticketsRepository.getByUserIdAndAvailability( user.userId, true );

    if ( !availableTickets.length ) {
        res.status( 404 ).json( { success: false, error: 'Could not find any available tickets for this user' } );
        return;
    }

    const ticket = await ticketsRepository.addToContest( availableTickets[0].ticketId, contestId );

    if ( ticket ) {
        res.json( { success: true, ticket } );
        return;
    }

    res.status( 500 ).json( { success: false, error: 'Could not redeem ticket' } );
};

module.exports = {
    getAllTickets,
    getTicketsByUser,
    getTicketsByContestId,
    createTicket,
    redeemTicket,
}