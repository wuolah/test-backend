const usersRepository = require( '../repositories/usersRepository' );

const getUserByEmailOrLogin = async ( req, res ) => {
    const { emailLogin } = req.params;

    const user = await usersRepository.getByEmailOrLogin( emailLogin.trim() );

    if ( user ) {
        res.json( { success: true, user } );
        return;
    }

    res
        .status( 404 )
        .json( { success: false, error: 'Could not find user with provided "email" or "login"' } );

};

const createUser = async ( req, res ) => {
    const { email, password, name, login } = req.body;

    if ( !email || !password || !name || !login ) {
        res.status( 400 ).json( { success: false, error: 'Some fields missing, check your info and sign up again' } );
        return;
    }

    const userByEmail = await usersRepository.getByEmail( email.trim() );

    if ( userByEmail ) {
        res.status( 400 ).json( { success: false, error: 'User with provided email already exists' } );
        return;
    }

    const userByLogin = await usersRepository.getByLogin( login.trim() );

    if ( userByLogin ) {
        res.status( 400 ).json( { success: false, error: 'User with provided login already exists' } );
        return;
    }

    const newUser = await usersRepository.create( email.trim(), password, name.trim(), login.trim() );

    if ( newUser ) {
        res.json( { success: true, user: newUser } );
        return;
    }

    res.status( 500 ).json( { success: false, error: 'Could not create user' } );
};


module.exports = {
    getUserByEmailOrLogin,
    createUser
}