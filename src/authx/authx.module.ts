import { Module } from '@nestjs/common';

import { authx } from './authx.provider';
import { LoginModule } from '../login/login.module';
import { MeModule } from '../me/me.module';
import { RecordModule } from '../record/record.module';

/**
 * This module exists to configure `@eropple/nestjs-auth` and make it available
 * for
 */
@Module({
  imports: [LoginModule, MeModule, RecordModule],
  providers: [authx],
})
export class AuthxModule {}
