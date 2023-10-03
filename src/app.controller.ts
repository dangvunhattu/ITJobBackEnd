import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local.auth.guard';
import { AuthService } from './auth/auth.service';
import { Public } from './decorator/customize';
// import { AuthenticatedGuard } from './stateful/passport/stateful.local.authenticated.guard';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly usersService: UsersService,
        private authService: AuthService,
    ) {}
}
