import { Injectable } from '@nestjs/common';
import { RightsTree } from '@eropple/nestjs-auth/dist';

@Injectable()
export class MeService {
  readonly tree: RightsTree = {
    children: {
      // `user/view` is implicitly pointing at the identified user at all times.
      // Since this is the case, we're never going to have a case where, given
      // the `user/view` grant, a requestor can't find the answer to "who am I?"
      view: {
        right: () => true
      }
    }
  };
}
