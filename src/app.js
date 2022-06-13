const express = require( "express" );
const serverless = require( "serverless-http" );
const { getAllContests, getContestById, createContest } = require( "./controllers/contests" );
const { getAllTickets, createTicket, redeemTicket, getTicketsByUser, getTicketsByContestId } = require( "./controllers/tickets" );
const { getUserByEmailOrLogin, createUser } = require( "./controllers/users" );

const app = express();


app.use( express.json() );

// Users routes
app.get( "/users/:emailLogin", getUserByEmailOrLogin );
app.post( "/users", createUser );

// Contests routes
app.get( "/contests", getAllContests );
app.get( '/contests/:id', getContestById );
app.get( '/contests/:id/participants', getTicketsByContestId );
app.post( '/contests', createContest );

// Tickets routes
app.get( "/tickets", getAllTickets ); // To demo purpose, I want to get all tickets. This endpoint will be removed in the production version
app.get( "/tickets/user/:userInfo", getTicketsByUser );
app.post( '/tickets/redeem', redeemTicket );
/**
 * createTicket:
 * To demo purpose, I want to have an endpoint to create a ticket. 
 * In the production version, I wouldn't have this endpoint cause 
 * it will be an internal call when the user meets requierements 
 * to get a new one
 */
app.post( "/tickets", createTicket );


// Non-existent routes
app.use( ( req, res, next ) => {
  return res.status( 404 ).json( {
    success: false,
    error: "Not Found",
  } );
} );

module.exports.handler = serverless( app );