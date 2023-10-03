import { Public, ResponseMessage, UserDecorator } from '@/decorator/customize';
import { Body, Controller, Req, Post, Res, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local.auth.guard';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from '@/users/user.interface';
import { RolesService } from '@/roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
// import { AuthenticatedGuard } from './stateful/passport/stateful.local.authenticated.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private roleService: RolesService) {}

    @Public()
    @UseGuards(LocalAuthGuard)
    @UseGuards(ThrottlerGuard)
    @ResponseMessage('user login')
    @Post('/login')
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @ResponseMessage('Register a new user')
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @ResponseMessage('Get user infomation')
    @Get('/account')
    async handleGetAccount(@UserDecorator() user: IUser) {
        const temp = (await this.roleService.findOne(user.role._id)) as any;
        user.permissions = temp.permissions;
        return { user };
    }

    @Public()
    @ResponseMessage('Get user by refresh token')
    @Get('/refresh')
    handleRequestToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies['refresh_token'];
        return this.authService.processNewToken(refreshToken, response);
    }

    @ResponseMessage('Loggout user')
    @Post('/logout')
    handleLogout(@Res({ passthrough: true }) response: Response, @UserDecorator() user: IUser) {
        return this.authService.logout(response, user);
    }
}
