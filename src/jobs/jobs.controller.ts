import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, UserDecorator } from '@/decorator/customize';
import { IUser } from '@/users/user.interface';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) {}

    @Post()
    @ResponseMessage('Create a new job')
    create(@Body() createJobDto: CreateJobDto, @UserDecorator() user: IUser) {
        return this.jobsService.create(createJobDto, user);
    }

    @Public()
    @Get()
    @ResponseMessage('Fetch jobs with pagination')
    findAll(
        @Query('current') currentPage: string,
        @Query('pageSize') limit: string,
        @Query() qs: string,
    ) {
        return this.jobsService.findAll(+currentPage, +limit, qs);
    }

    @Public()
    @Get(':id')
    @ResponseMessage('Fetch a job by id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Patch(':id')
    @ResponseMessage('Update a job')
    update(
        @Param('id') id: string,
        @Body() updateJobDto: UpdateJobDto,
        @UserDecorator() user: IUser,
    ) {
        return this.jobsService.update(id, updateJobDto, user);
    }

    @Delete(':id')
    @ResponseMessage('Delete a job')
    remove(@Param('id') id: string, @UserDecorator() user: IUser) {
        return this.jobsService.remove(id, user);
    }
}
