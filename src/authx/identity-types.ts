// tslint:disable: max-classes-per-file
import {
  AnonymousBill,
  IdentifiedBill,
  RightsTree,
} from '@eropple/nestjs-auth';
import { IdentifiedExpressRequest } from '@eropple/nestjs-auth';

import { User } from '../login/user';

export enum PrincipalType {
  USER = 'user',
  INTERNAL_SERVICE = 'internal_service',
}

// tslint:disable-next-line: no-empty-interface
export interface InternalService {}

/**
 * Defines all legal types of principal ("thing that can authn and be authz'd")
 * for this app. It might just be `User` for your app. One thing I've done,
 * however, is use an AWS Cognito federated identity pool with my corporate
 * GMail accounts to have an `Employee` principal granted administrative access
 * and being logged to that effect.
 */
export type Principal = User | InternalService;

/**
 * Acts as a top-level class for your application's use of `nestjs-auth`. If you
 * use the `@Identity` parameter decorator in an `@AuthnRequired()` (or just a
 * default) method, then you can guarantee that the value passed will be a
 * subclass of `MyAppIdentifiedBill` and can make decisions to that effect.
 */
export abstract class MyAppIdentifiedBill<
  TPrincipal extends Principal
> extends IdentifiedBill<TPrincipal, {}> {
  /**
   * By implementing this in subclasses, you get type discrimination for free.
   * You can just `switch` on it and the TypeScript compiler will be smart
   * enough to downcast--in our case, to either `UserBill` or `InternalServiceBill`
   * as appropriate.
   */
  abstract get type(): PrincipalType;
}

export class UserBill extends MyAppIdentifiedBill<User> {
  readonly type: PrincipalType.USER = PrincipalType.USER;
}

export class InternalServiceBill extends MyAppIdentifiedBill<InternalService> {
  readonly type: PrincipalType.INTERNAL_SERVICE = PrincipalType.INTERNAL_SERVICE;
}

export type MyAppAnyIdentifiedBill = UserBill | InternalServiceBill;
export type MyAppIdentityBill = AnonymousBill | MyAppAnyIdentifiedBill;

export type MyAppRightsTree = RightsTree<
  MyAppIdentityBill,
  IdentifiedExpressRequest<MyAppIdentityBill>
>;
