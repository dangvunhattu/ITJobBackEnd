import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from '@/users/user.interface';
import { RolesService } from '@/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService, private roleService: RolesService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: IUser) {
        const { _id, name, email, role } = payload;
        // need to push permissions to req.user
        const userRole = role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);

        return {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
        };
    }
}
