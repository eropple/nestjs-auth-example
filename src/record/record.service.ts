import { Injectable } from '@nestjs/common';
import { RightsTree, IdentifiedBill } from '@eropple/nestjs-auth';
import { fromPairs, cloneDeep } from 'lodash';

import { User } from '../login/user';
import { Record } from './record';
import { AppIdentifiedBill } from 'src/authx/app-identity';

const records = [
  new Record("foo", "Hello world!", false, ["alice", "bob", "charlie"], ["alice"]),
  new Record("bar", "nobody can edit", false, ["alice", "bob"], []),
  new Record("public", "bob can edit", true, ["bob"], ["bob"])
];

@Injectable()
export class RecordService {
  private readonly _records: { [name: string]: Record };
  
  readonly tree: RightsTree = {
    children: {
      // anyone can _try_ to list records; the `listRecords` method filters what
      // you can actually see. (this includes anonymous identities.)
      list: {
        right: () => true
      },
    },
    // The `wildcard` field is the default child node for anything that isn't
    // explicitly enumerated in `children`, which makes it useful for stuff like
    // scoping specific records by name.
    wildcard: {
      // Here we see a couple of new things (mostly because this is actually a
      // endpoint that requires some rights logic in a way that we haven't seen
      // yet!). `context` is called on every node as one descends the rights
      // tree. It allows the sending of additional information to child nodes.
      // In this case, `scopePart` is the ID of our record and we can store the
      // record object in it so the `right` functions (for, say,
      // `record/:fileId/view`) have it to access without needing scope info
      // outside its own node.
      context: async (scopePart, request) => {
        const record = await this.getRecordByName(scopePart);
        
        // context functions can signal that it is impossible for any child
        // nodes to evaluate their `right` as valid. In this case, it's because
        // there is no record to find and we don't want to return a 404 as we
        // don't want a hypothetical attacker to know about the existence of a
        // record they can't access. In another case, it might be that the
        // request is trying to access a resource owned by another resource; as
        // an example, consider a GitHub organization with private repos--a user
        // who is not a member of the organization shouldn't be able to find out
        // anything about private repos at all. 
        if (!record) {
          return false;
        }

        request.locals.record = record;
      },
      children: {
        view: {
          right: (_scopePart, request) => {
            const record: Record = request.locals.record;

            // this is admittedly a bit of a casting hack, but we have proven to
            // our satisfaction that this will always hold.
            return  record.isPublic ||
                    (request.identity instanceof IdentifiedBill &&
                      record.usersWithReadAccess.includes((request.identity as AppIdentifiedBill).principal.username)
                    )
          }
        },
        edit: {
          right: (_scopePart, request) => {
            const record: Record = request.locals.record;

            return  (request.identity instanceof IdentifiedBill &&
                      record.usersWithEditAccess.includes((request.identity as AppIdentifiedBill).principal.username)
                    )
          }
        }
      }
    }
  };
  
  constructor() {
    this._records = fromPairs(records.map(r => [r.name, cloneDeep(r)]));
  }
  
  // annoying nit: this should be `DeepReadonly<Record>` to provide a read-only
  // view, to properly simulate that this is actually a database and these
  // records are being sourced from it, but it gets into stupid export type
  // problems and this is the toyest of examples. please mindcaulk as necessary.
  async listRecords(user: User | null): Promise<Array<Record>> {
    return Object.values(this._records).filter(
      r =>  r.isPublic ||
      (user && (
        r.usersWithReadAccess.includes(user.username) ||
        r.usersWithEditAccess.includes(user.username)
        )
      )
    );
  }
      
  async getRecordByName(name: string): Promise<Record | null> {
    return this._records[name] || null;
  }

  async updateRecord(author: User, name: string, content: string): Promise<Record> {
    const record = await this.getRecordByName(name);
    if (!record) {
      throw new Error(`No record found: '${record}'.`);
    }

    record.content = content;
    record.lastEditor = author.username;

    return record;
  }
}
