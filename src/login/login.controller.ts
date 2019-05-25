import { Controller, Get, Post, Body, HttpException, HttpCode } from '@nestjs/common';
import { AuthnDisallowed, AuthzScope, AuthnRequired } from '@eropple/nestjs-auth';

import { LoginService } from './login.service';
import { LoginRequest } from './login-request';

@Controller('login')
@AuthnDisallowed() // you can use this at the controller level and override it at the handler level
export class LoginController {
  constructor(private readonly loginService: LoginService) {

  }

  @Post()
  @AuthzScope([]) // anonymous user; we don't need grants or rights to hit this.
  @HttpCode(200)
  async login(@Body() loginRequest: LoginRequest) {
    const token = await this.loginService.login(loginRequest.username, loginRequest.password, loginRequest.scopes);

    if (token) {
      return { token };
    }

    throw new HttpException("Bad username or password.", 401);
  }

  @Post("revoke-token")
  @AuthnRequired() // takes precedence over the controller-level decorator
  @AuthzScope([]) // IMO, it's good practice that a session can always self-terminate
  logout(): { ok: boolean } {
    // sure, we're not actually revoking our token, but whatever, it's fiiiine
    return { ok: true };
  }
}
