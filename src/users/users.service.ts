import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync, hash } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { IUser } from './user.interface';
import { UserDecorator } from '@/decorator/customize';
import { UpdateUserDto } from './dto/update-user.dto';
import aqp from 'api-query-params';
import { Role, RoleDocument } from '@/roles/schemas/role.schema';
import { USER_ROLE } from '@/databases/sample';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>,

        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,
    ) {}

    getHashPassword = (password: string) => {
        const salt = genSaltSync(10);
        const hash = hashSync(password, salt);
        return hash;
    };

    // async update(updateUserDto: UpdateUserDto) {
    //     return await this.userModel.updateOne({ _id: UpdateUserDto._id }, { ...updateUserDto });
    // }

    // async onModuleInit() {
    //     const count = await this.userModel.count();
    //     if (count === 0) {
    //         const salt = genSaltSync(10);
    //         const hash = hashSync(this.configService.get<string>('INIT_USER_PASSWORD'), salt);
    //         await this.userModel.insertMany([
    //             {
    //                 name: 'Eric',
    //                 email: 'admin@gmail.com',
    //                 password: hash,
    //             },
    //             {
    //                 name: 'User',
    //                 email: 'user@gmail.com',
    //                 password: hash,
    //             },
    //             {
    //                 name: 'User 1',
    //                 email: 'user1@gmail.com',
    //                 password: hash,
    //             },
    //             {
    //                 name: 'User 2',
    //                 email: 'user2@gmail.com',
    //                 password: hash,
    //             },
    //             {
    //                 name: 'User 3',
    //                 email: 'user3@gmail.com',
    //                 password: hash,
    //             },
    //         ]);
    //     }
    // }

    async findOneByUsername(username: string) {
        return this.userModel
            .findOne({
                email: username,
            })
            .populate({ path: 'role', select: { name: 1 } });
    }

    async findByEmail(email: string) {
        return await this.userModel.findOne({ email });
    }

    isValidPassword(password: string, hash: string) {
        return compareSync(password, hash);
    }

    async register(user: RegisterUserDto) {
        const { name, email, password, age, gender, address } = user;
        // check email exist
        const isExist = await this.userModel.findOne({ email });
        if (isExist) {
            throw new BadRequestException(
                `Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`,
            );
        }

        // Fetch user's role
        const userRole = await this.roleModel.findOne({ name: USER_ROLE });

        const hashPassword = this.getHashPassword(password);

        let newRegister = await this.userModel.create({
            name,
            email,
            password: hashPassword,
            age,
            gender,
            address,
            role: userRole?._id,
        });

        return newRegister;
    }

    async create(createUserDto: CreateUserDto, @UserDecorator() user: IUser) {
        const { name, email, password, age, gender, address, role, company } = createUserDto;
        // check email exist
        const isExist = await this.userModel.findOne({ email });
        if (isExist) {
            throw new BadRequestException(
                `Email: ${email} đã tồn tại trên hệ thống. Vui lòng sử dụng email khác.`,
            );
        }
        const hashPassword = this.getHashPassword(password);

        let newUser = await this.userModel.create({
            name,
            email,
            password: hashPassword,
            age,
            gender,
            address,
            role,
            company,
            createdAt: new Date(),
            createdBy: {
                _id: user._id,
                email: user.email,
            },
        });

        return newUser;
    }

    async update(updateUserDto: UpdateUserDto, @UserDecorator() user: IUser) {
        const updated = await this.userModel.updateOne(
            {
                _id: updateUserDto._id,
            },
            {
                ...updateUserDto,
                updatedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );
    }

    async remove(id: string, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return 'Not found user';
        }

        const foundUser = await this.userModel.findById(id);
        if (foundUser && foundUser.email === process.env.ADMIN_ACCOUNT) {
            throw new BadRequestException("Can't delete a admin account!!!");
        }

        await this.userModel.updateOne(
            {
                _id: id,
            },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );
        return this.userModel.softDelete({ _id: id });
    }

    async findOne(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return 'Not found user';
        }

        return await this.userModel
            .findOne({
                _id: id,
            })
            .select('-password')
            .populate({ path: 'role', select: { name: 1, _id: 1 } });
    }

    async findAll(currentPage: number, limit: number, qs: string) {
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        let offset = (+currentPage - 1) * +limit;
        let defaultLimit = +limit ? +limit : 10;

        const totalItems = (await this.userModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.userModel
            .find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any)
            .select('-password')
            .populate(population)
            .exec();

        return {
            meta: {
                current: currentPage,
                pageSize: limit,
                pages: totalPages,
                total: totalItems,
            },
            result,
        };
    }

    updateUserToken = async (refreshToken: string, _id: string) => {
        return await this.userModel.updateOne(
            {
                _id,
            },
            { refreshToken },
        );
    };

    findUserByToken = async (refreshToken: string) => {
        return await this.userModel
            .findOne({ refreshToken })
            .populate({ path: 'role', select: { name: 1 } });
    };
}
