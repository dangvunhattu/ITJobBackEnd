import { Permission, PermissionDocument } from '@/permissions/schemas/permission.schema';
import { Role, RoleDocument } from '@/roles/schemas/role.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
    constructor(
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>,

        @InjectModel(Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>,

        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,

        private configService: ConfigService,
        private userService: UsersService,
    ) {}

    async onModuleInit() {
        const isInit = this.configService.get<string>('SHOULD_INIT');
        if (Boolean(isInit)) {
            const countUser = await this.userModel.count({});
            const countPermission = await this.permissionModel.count({});
            const countRole = await this.roleModel.count({});

            // create permissions
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
            }

            // create role
            if (countRole === 0) {
                const permissions = await this.permissionModel.find({}).select('_id');
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: 'Admin thì full quyền :v',
                        isActive: true,
                        permissions: permissions,
                    },
                    {
                        name: USER_ROLE,
                        description: 'Người dùng/ứng viên sử dụng hệ thống',
                        isActive: true,
                        permissions: [], // không set quyền, chỉ cần add role
                    },
                ]);
            }

            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE });
                await this.userModel.insertMany([
                    {
                        name: "I'm admin",
                        email: 'admin@gmail.com',
                        password: this.userService.getHashPassword(
                            this.configService.get<string>('INIT_PASSWORD'),
                        ),
                        age: 69,
                        gender: 'MALE',
                        address: 'Vietnam',
                        role: adminRole?._id,
                    },
                    {
                        name: "I'm Loc",
                        email: 'nyaakuromisu@gmail.com',
                        password: this.userService.getHashPassword(
                            this.configService.get<string>('INIT_PASSWORD'),
                        ),
                        age: 96,
                        gender: 'MALE',
                        address: 'Vietnam',
                        role: adminRole?._id,
                    },
                    {
                        name: "I'm normal user",
                        email: 'user@gmail.com',
                        password: this.userService.getHashPassword(
                            this.configService.get<string>('INIT_PASSWORD'),
                        ),
                        age: 96,
                        gender: 'MALE',
                        address: 'Vietnam',
                        role: userRole?._id,
                    },
                ]);
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                // console.log("")
            }
        }
    }
}
