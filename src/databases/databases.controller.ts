import { Controller } from '@nestjs/common';
import { DatabasesService } from './DatabasesService';

@Controller('databases')
export class DatabasesController {
    constructor(private readonly databasesService: DatabasesService) {}
}
