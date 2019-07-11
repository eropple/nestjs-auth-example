import { Controller, Get } from '@nestjs/common';
import { AuthnOptional, Identity, AuthzScope } from '@eropple/nestjs-auth/dist';
import { AppIdentityBill, AppIdentifiedBill } from './authx/app-identity';

@Controller()
export class AppController {
  @Get('hello')
  @AuthnOptional()
  @AuthzScope([])
  hello(@Identity() identity: AppIdentityBill): { message: string } {
    if (identity.isAnonymous) {
      return { message: 'Hello, stranger!' };
    }

    return {
      message: `Hello, ${(identity as AppIdentifiedBill).principal.username}!`,
    };
  }
}
