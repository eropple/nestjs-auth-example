import { IdentifiedBill, IdentityBill, AnonymousBill } from "@eropple/nestjs-auth";

import { User } from "../login/user";

export type AppIdentifiedBill = IdentifiedBill<User, string>;

/**
 * The generically aliased type to be used within the app for identified
 * requests.
 */
export type AppIdentityBill = AnonymousBill | AppIdentifiedBill;
