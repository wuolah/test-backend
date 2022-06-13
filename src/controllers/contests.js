const contestsRepository = require( '../repositories/contestsRepository' );

const getAllContests = async ( req, res ) => {
    const contests = await contestsRepository.getAll();

    if ( contests.length ) {
        res.json( { success: true, contests } );
    } else {
        res.status( 404 ).json( { success: false, error: 'Could not find any contests' } );
    }
};

const getContestById = async ( req, res ) => {
    const { id } = req.params;

    const contest = await contestsRepository.getById( id );

    if ( contest ) {
        res.json( { success: true, contest } );
    } else {
        res.status( 404 ).json( { success: false, error: 'Could not find contest with provided id' } );
    }
};

const createContest = async ( req, res ) => {
    const { name, description } = req.body;

    if ( !name || !description ) {
        res.status( 400 ).json( { success: false, error: 'Some fields missing, check contest info and register again' } );
        return;
    }

    const contest = await contestsRepository.create( name, description );

    if ( contest ) {
        res.json( { success: true, contest } );
    } else {
        res.status( 500 ).json( { success: false, error: 'Could not create contest' } );
    }
};

module.exports = {
    getAllContests,
    getContestById,
    createContest,
}