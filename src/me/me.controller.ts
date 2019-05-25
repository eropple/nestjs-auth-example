import { Controller, Get } from '@nestjs/common';
import { AuthzScope, Identity } from '@eropple/nestjs-auth/dist';

import { AppIdentifiedBill } from '../authx/app-identity';
import { User } from '../login/user';

@Controller('me')
export class MeController {
  @Get()
  @AuthzScope(["user/view"])
  whoami(@Identity() identity: AppIdentifiedBill): User {
    // One note: we use `AppIdentifiedBill` here because we are guaranteed to
    // not have an anonymous identity (because, remember, @eropple/nestjs-auth
    // defaults to `@AuthnRequired()`.)
    //
    // If this was, for some reason, `@AuthnOptional()`, our `@Identity()`
    // parameter could return `AppIdentityBill`, which is defined in
    // `src/authx/app-identity` as `AnonymousBill | AppIdentifiedBill`. So we'd
    // have to look at the `isAnonymous`/`isIdentified` properties to determine
    // what we actually had.
    return identity.principal;
  }
}
