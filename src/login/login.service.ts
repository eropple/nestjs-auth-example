import { Injectable } from '@nestjs/common';
import { fromPairs, cloneDeep } from 'lodash';

import { User } from './user';

const users: ReadonlyArray<User> = [
  new User('alice'),
  new User('bob'),
  new User('charlie'),
];

@Injectable()
export class LoginService {
  private readonly users: { [name: string]: User };

  constructor() {
    this.users = fromPairs(users.map(u => [u.username, cloneDeep(u)]));
  }

  async getUserByName(name: string): Promise<User | null> {
    return this.users[name] || null;
  }

  /**
   * Our highly secure login method.
   *
   * @param name the username to log in
   * @param password the very secret password for the user
   * @param scopes the scopes to attach to this token
   */
  async login(
    name: string,
    password: string,
    scopes: ReadonlyArray<string>,
  ): Promise<string | null> {
    const user = await this.getUserByName(name);

    if (!user) {
      return null;
    }

    // our password handling is magnifique. gaze in awe.
    if (password !== 'hunter2') {
      return null;
    }

    // our session token. it's very secure.
    return `${name
      .split('')
      .reverse()
      .join('')}-${scopes.join('|')}`;
  }
}
