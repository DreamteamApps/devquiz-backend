/**
 * Models
 * 
*/
const Database = use('Database')
const User = use("App/Models/User")

const GitHub = use("App/Infrastructure/Github")
const UserType = use('App/Enum/UserType')


/**
 * Gets a user in github, create it or update in our database and return it
 *
 * @param {string} githubUser
*/
module.exports.getOrCreateUser = async (githubUser,pushToken) => {
    const { login, name, public_repos, avatar_url } = await GitHub.getUserInformation(githubUser);

    if (!login) {
        return {
            "errorCode": 1,
            "message": "This user doesn't exists!"
        }
    }

    let existingUser = await User.findBy('username', login);
    if (!existingUser) {
        await User.create({
            username: login,
            name: name || login,
            repos_quantity: public_repos,
            image_url: avatar_url,
            push_token: pushToken
        });
        existingUser = await User.findBy('username', login);
    } else {
        existingUser.merge({
            repos_quantity: public_repos,
            image_url: avatar_url,
            updated_at: new Date(),
            push_token: pushToken
        })
        await existingUser.save();
    }

    return {
        id: existingUser.id,
        login: existingUser.username,
        name: existingUser.name,
        avatar: existingUser.image_url,
        repos: existingUser.repos_quantity,
        score: existingUser.score,
        wins: existingUser.wins,
        losses: existingUser.losses,
        ties: existingUser.ties
    }
}

/**
 * Safe sets the socketId of userId
 *
 * @param {integer} userId
 * @param {string} socketId
*/
module.exports.setUserSocketId = async (userId, socketId) => {
    const user = await User.findBy('id', userId);

    user.merge({
        socket_id: socketId
    });

    user.save();
}

/**
 * Get user by id
 *
 * @param {string} userId
*/
module.exports.getUserById = async (userId) => {
    const user = await User.findBy('id', userId);
    return user;
}

/**
 * Get user by email
 *
 * @param {string} email
*/
module.exports.getUserByEmail = async (email) => {
    const user = await User.findBy('email', email);
    return user;
}

/**
 * Get user by socketId
 *
 * @param {string} socketId
*/
module.exports.getUserBySocketId = async (socketId) => {
    const user = await User.findBy('socket_id', socketId);
    return user;
}

/**
 * Gets the list of recent users in app
 *
*/
module.exports.getRecentUsers = async () => {
    const users = await Database.table('users').where('type', UserType.USER).orderBy('updated_at', 'desc').limit(10);

    return users.map((user) => {
        return {
            id: user.id,
            name: user.username,
            avatar: user.image_url
        }
    });
}