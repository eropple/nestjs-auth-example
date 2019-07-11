import { flatten } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FactoryProvider } from '@nestjs/common/interfaces';
import {
  PrincipalFn,
  HttpAuthxInterceptor,
  PrincipalFnRet,
  IdentifiedBill,
} from '@eropple/nestjs-auth';

import { ROOT_LOGGER } from '../logging';
import { LoginService } from '../login/login.service';
import { MeService } from '../me/me.service';
import { RecordService } from '../record/record.service';
import { MyAppRightsTree, MyAppIdentifiedBill, Principal, UserBill } from './identity-types';

export const authx: FactoryProvider = {
  provide: APP_INTERCEPTOR, // PAY ATTENTION TO THIS: IT'S REQUIRED.
  inject: [LoginService, MeService, RecordService],
  useFactory: (
    loginService: LoginService,
    meService: MeService,
    recordService: RecordService,
  ) => {
    const principalFn: PrincipalFn<MyAppIdentifiedBill<Principal>> = async (
      headers,
      cookies,
      request,
    ): Promise<PrincipalFnRet<MyAppIdentifiedBill<Principal>>> => {
      // TODO:  provide the "internal services" example
      //        It should be pretty obvious, though - you just return an
      //        `InternalServicesBill`, as defined in `./identity-types.ts`, and
      //        authz treats it as appropriate.
      const token = flatten([headers['x-app-token']])[0];
      if (!token) {
        // no token, so we have an anonymous user (which will be constructed
        // within @eropple/nestjs-auth, we don't have to return an anonymous
        // identity of our own)
        return null;
      }

      const [eman, grantString] = token.split('-');
      const name: string = eman!
        .split('')
        .reverse()
        .join('');
      const grants: Array<string> = grantString.split('|');

      const user = await loginService.getUserByName(name);
      if (!user) {
        // If the token is invalid, we return false, which sends a 401
        // Unauthorized. In a real app you'd do this if your token is invalid,
        // expired, points to a locked user, that sort of thing.
        return false;
      }

      return new UserBill(user, token, grants);
    };

    // the authz rights tree
    const tree: MyAppRightsTree = {
      children: {
        // I like this pattern as an easy way to encapsulate who rights
        // management; we're centralizing it here, but `MeService` can use
        // its own injected dependencies to figure out its own business in its
        // own files. I've also broken it out into a separate provider,
        // `MeAuthz`, to some success (but I didn't want to clutter this project
        // TOO too much).
        user: meService.tree,
        record: recordService.tree,
      },
    };

    return new HttpAuthxInterceptor({
      logger: ROOT_LOGGER.child({ component: 'HttpAuthx' }),
      authn: {
        principalFn,
        // these scopes are used to make sure anonymous readers can view public
        // records. To hammer home what I hope is already obvious: that the
        // anonymous identity has a grant of `record/*/view` does _not_ entitle
        // the anonymous identity to see every record. It allows the anonymous
        // identity to see every record that it has _rights_ to see, and the
        // correct right in that tree is the final arbiter.
        anonymousScopes: ['record/list', 'record/*/view'],
      },
      authz: {
        tree,
      },
    });
  },
};
