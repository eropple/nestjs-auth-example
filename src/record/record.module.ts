import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';

@Module({
  providers: [RecordService],
  controllers: [RecordController],
  exports: [RecordService]
})
export class RecordModule {}
