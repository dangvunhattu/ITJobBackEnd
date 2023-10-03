import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from '@/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectModel(Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>,
    ) {}

    async create(createPermissionDto: CreatePermissionDto, user: IUser) {
        const { name, apiPath, method, module } = createPermissionDto;

        const isExist = await this.permissionModel.findOne({ apiPath, method });
        if (isExist) {
            throw new BadRequestException(
                `Permission with apiPath=${apiPath}, method=${method} has already existed!!!`,
            );
        }

        let newPermission = await this.permissionModel.create({
            name,
            apiPath,
            method,
            module,
            createdBy: {
                _id: user._id,
                email: user.email,
            },
        });

        return {
            _id: newPermission?._id,
            createdAt: newPermission?.createdAt,
        };
    }

    async findAll(currentPage: number, limit: number, qs: string) {
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        let offset = (+currentPage - 1) * +limit;
        let defaultLimit = +limit ? +limit : 10;

        const totalItems = (await this.permissionModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.permissionModel
            .find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any)
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

    async findOne(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Not found permission');
        }
        return await this.permissionModel.findById(id);
    }

    async update(_id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            throw new BadRequestException('Not found permission');
        }

        const { module, method, apiPath, name } = updatePermissionDto;

        const updated = await this.permissionModel.updateOne(
            { _id },
            { module, method, apiPath, name, updatedBy: { _id: user._id, email: user.email } },
        );

        return updated;
    }

    async remove(_id: string, user: IUser) {
        await this.permissionModel.updateOne(
            {
                _id,
            },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );
        return this.permissionModel.softDelete({
            _id,
        });
    }
}
