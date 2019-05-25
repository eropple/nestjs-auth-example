import { flatten } from "@nestjs/common";
import { FactoryProvider } from "@nestjs/common/interfaces";
import { PrincipalFn, HttpAuthnInterceptor, PrincipalFnRet, IdentifiedBill } from "@eropple/nestjs-auth";

import { ROOT_LOGGER } from "../logging";
import { LoginService } from "../login/login.service";

export const authn: FactoryProvider = {
  provide: HttpAuthnInterceptor,
  inject: [LoginService],
  useFactory: (loginService: LoginService) => {
    const principalFn: PrincipalFn =
      async (headers, cookies, _request): Promise<PrincipalFnRet> => {
        const token = flatten([headers["x-app-token"]])[0];
        if (!token) {
          // no token, so we have an anonymous user (which will be constructed
          // within @eropple/nestjs-auth, we don't have to return an anonymous
          // identity of our own)
          return null;
        }

        const [ eman, grantString ] = token.split("-");
        const name: string = eman!.split("").reverse().join("");
        const grants: Array<string> = grantString.split("|");

        const user = await loginService.getUserByName(name);
        if (!user) {
          // If the token is invalid, we return false, which sends a 401
          // Unauthorized. In a real app you'd do this if your token is invalid,
          // expired, points to a locked user, that sort of thing.
          return false;
        }

        return new IdentifiedBill(user, token, grants);
      }

    return new HttpAuthnInterceptor({
      principalFn,
      // these scopes are used to make sure anonymous readers can view public
      // records. To hammer home what I hope is already obvious: that the
      // anonymous identity has a grant of `record/*/view` does _not_ entitle
      // the anonymous identity to see every record. It allows the anonymous
      // identity to see every record that it has _rights_ to see, and the
      // correct right in that tree is the final arbiter.
      anonymousScopes: ["record/list", "record/*/view"],
      logger: ROOT_LOGGER.child({ component: "HttpAuthn" })
    });
  }
};
