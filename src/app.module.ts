import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoginModule } from './login/login.module';
import { AuthxModule } from './authx/authx.module';
import { MeModule } from './me/me.module';
import { RecordModule } from './record/record.module';


@Module({
  imports: [LoginModule, AuthxModule, MeModule, RecordModule],
  controllers: [AppController]
})
export class AppModule {}
