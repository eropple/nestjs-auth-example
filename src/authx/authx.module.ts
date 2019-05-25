import { Module } from '@nestjs/common';
import { HttpAuthnInterceptor, HttpAuthzInterceptor } from '@eropple/nestjs-auth';

import { authn } from './authn.provider';
import { authz } from './authz.provider';
import { LoginModule } from '../login/login.module';
import { MeModule } from '../me/me.module';
import { RecordModule } from '../record/record.module';

/**
 * This module exists to configure `@eropple/nestjs-auth` and make it available
 * for 
 */
@Module({
  imports: [
    LoginModule,
    MeModule,
    RecordModule
  ],
  providers: [
    authn,
    authz
  ],
  exports: [
    HttpAuthnInterceptor,
    HttpAuthzInterceptor
  ]
})
export class AuthxModule {

}
