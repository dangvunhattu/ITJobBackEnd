import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public, ResponseMessage, UserDecorator } from '@/decorator/customize';
import { IUser } from './user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ResponseMessage('Create a new user')
    async create(@Body() createUserDto: CreateUserDto, @UserDecorator() user: IUser) {
        let newUser = await this.usersService.create(createUserDto, user);
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt,
        };
    }

    @Patch()
    @ResponseMessage('Update a user')
    async update(@Body() updateUserDto: UpdateUserDto, @UserDecorator() user: IUser) {
        let updateUser = await this.usersService.update(updateUserDto, user);
        return updateUser;
    }

    @Delete(':id')
    @ResponseMessage('Delete a user')
    remove(@Param('id') id: string, @UserDecorator() user: IUser) {
        return this.usersService.remove(id, user);
    }

    @Get()
    @ResponseMessage('Fetch user with paginate')
    findAll(
        @Query('current') currentPage: string,
        @Query('pageSize') limit: string,
        @Query() qs: string,
    ) {
        return this.usersService.findAll(+currentPage, +limit, qs);
    }

    @Public()
    @Get(':id')
    @ResponseMessage('Fetch user by id')
    async findOne(@Param('id') id: string) {
        const foundUser = await this.usersService.findOne(id);
        return foundUser;
    }
}
