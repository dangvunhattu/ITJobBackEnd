import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, UserDecorator } from '@/decorator/customize';
import { IUser } from '@/users/user.interface';

@Controller('resumes')
export class ResumesController {
    constructor(private readonly resumesService: ResumesService) {}

    @Post()
    @ResponseMessage('Create a new resume')
    create(@Body() createUserCvDto: CreateUserCvDto, @UserDecorator() user: IUser) {
        return this.resumesService.create(createUserCvDto, user);
    }

    @Post('by-user')
    @ResponseMessage('Get resume by user')
    getResumeByUser(@UserDecorator() user: IUser) {
        return this.resumesService.findByUsers(user);
    }

    @Get()
    @ResponseMessage('Fetch resumes with pagination')
    findAll(
        @Query('current') currentPage: string,
        @Query('pageSize') limit: string,
        @Query() qs: string,
    ) {
        return this.resumesService.findAll(+currentPage, +limit, qs);
    }

    @Get(':id')
    @ResponseMessage('Fetch a resume by id')
    findOne(@Param('id') id: string) {
        return this.resumesService.findOne(id);
    }

    @Patch(':id')
    @ResponseMessage('Fetch a resume by id')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: string,
        @UserDecorator() user: IUser,
    ) {
        return this.resumesService.update(id, status, user);
    }

    @Delete(':id')
    @ResponseMessage('Delete a resume')
    remove(@Param('id') id: string, @UserDecorator() user: IUser) {
        return this.resumesService.remove(id, user);
    }
}
