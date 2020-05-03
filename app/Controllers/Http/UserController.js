'use strict'

const UserDomain = use('App/Domain/UserDomain')
const UserType = use('App/Enum/UserType')

class UserController {

  /**
   * Gets the list of recent users in app
  */
  async getRecentUsers({ params }) {
    const { userId } = params;

    const result = await UserDomain.getRecentUsers(userId);
    return result;
  }

  /**
   * Gets a user in github, create it or update in our database and return it
   * @param {string} githubuser
   * @param {string} pushToken
  */
  async getOrCreateUser({ request, response }) {
    const { githubuser, pushToken } = request.only(['githubuser', 'pushToken']);

    const result = await UserDomain.getOrCreateUser(githubuser, pushToken);

    if (!result.errorCode) {
      return result;
    }

    return response.status(400).send(result);
  }

  /**
   * Authenticates an admin user
   *
   * @param {string} email
   * @param {string} password
  */
  async loginAdmin({ request, auth, response }) {
    const { email, password } = request.only(["email", "password"]);

    try {
      const user = await UserDomain.getUserByEmail(email);

      if (!user || user.type != UserType.ADMIN) throw "";

      const token = await auth.attempt(email, password);

      return {
        user: {
          name: user.username,
          email: user.email,
        },
        ...token
      }

    } catch (e) {
      return response.status(400).send({
        code: 8,
        message: 'Invalid email or password!'
      });

    }
  }
}

module.exports = UserController
