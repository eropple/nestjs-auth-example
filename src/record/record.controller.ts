import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  HttpException,
} from '@nestjs/common';
import {
  AuthnOptional,
  AuthzScope,
  Identity,
  IdentifiedBill,
} from '@eropple/nestjs-auth';

import { AppIdentityBill, AppIdentifiedBill } from '../authx/app-identity';
import { RecordService } from './record.service';
import { Record } from './record';

export interface PutRecordRequest {
  content: string;
}

@Controller('records')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get()
  @AuthnOptional()
  @AuthzScope(['record/list'])
  async listRecords(@Identity() identity: AppIdentityBill) {
    // As mentioned in `RecordService`, this method is generally available to
    // any user because we have to gate based on individual records (which
    // `RecordService` does for you.)
    return this.recordService.listRecords(
      identity instanceof IdentifiedBill ? identity.principal : null,
    );
  }

  @Get(':fileName')
  @AuthnOptional()
  // hey, our first dynamic scope! This is why we use `IdentifiedExpressRequest`
  // in some places; life is too short to reinvent params parsing. Fastify users
  // are welcome to submit a PR.
  @AuthzScope(req => [`record/${req.params.fileName}/view`])
  async getRecord(@Param('fileName') fileName: string): Promise<Record> {
    // we have implicitly proven, because we've passed the correct entries in
    // the rights tree, that the record exists and that the current identity is
    // allowed to access it.

    return this.recordService.getRecordByName(fileName);
  }

  @Put(':fileName')
  @AuthzScope(req => [`record/${req.params.fileName}/edit`])
  async putRecord(
    @Identity() identity: AppIdentifiedBill,
    @Param('fileName') fileName: string,
    @Body() putRequest: PutRecordRequest,
  ): Promise<Record> {
    // again, we've implicitly proven that the record exists and that the
    // user can edit it. (This is one of my favorite things about working with
    // @eropple/nestjs-auth: my controllers tend to get really thin.)

    if (!putRequest || !putRequest.content) {
      throw new HttpException(
        'Bad data: request must have a \'content\' field.',
        400,
      );
    }

    return this.recordService.updateRecord(
      identity.principal,
      fileName,
      putRequest.content,
    );
  }
}
