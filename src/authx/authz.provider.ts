import { FactoryProvider } from "@nestjs/common/interfaces";
import { HttpAuthzInterceptor, RightsTree } from "@eropple/nestjs-auth";

import { ROOT_LOGGER } from "../logging";
import { MeService } from "../me/me.service";
import { RecordService } from "../record/record.service";

export const authz: FactoryProvider = {
  provide: HttpAuthzInterceptor,
  inject: [MeService, RecordService],
  useFactory: (meService: MeService, recordService: RecordService) => {
    const tree: RightsTree = {
      children: {
        // I like this pattern as an easy way to encapsulate who rights
        // management; we're centralizing it here, but `MeService` can use
        // its own injected dependencies to figure out its own business in its
        // own files. I've also broken it out into a separate provider,
        // `MeAuthz`, to some success (but I didn't want to clutter this project
        // TOO too much).
        user: meService.tree,
        record: recordService.tree
      }
    };

    return new HttpAuthzInterceptor({
      logger: ROOT_LOGGER.child({ component: "HttpAuthz" }),
      tree
    });
  }
}
