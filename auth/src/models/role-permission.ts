import { NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { PermissionDoc } from './permission';
import { UserRoleDoc } from './user-role';
interface RolePermissionAttrs {
  id: string;
  permission: PermissionDoc;
  userRole: UserRoleDoc;
}
interface RolePermissionDoc extends mongoose.Document {
  permission: PermissionDoc;
  userRole: UserRoleDoc;
  version: number;
}

interface RolePermissionModel extends mongoose.Model<RolePermissionDoc> {
  build(attrs: RolePermissionAttrs): RolePermissionDoc;
  checkPermissionByRoleId(id: string): Promise<RolePermissionDoc | null>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<RolePermissionDoc | null>;
}

const rolePermissionSchema = new mongoose.Schema({
  permission: {
    type: mongoose.Types.ObjectId,
    ref: 'Permission',
    required: true,
  },
  userRole: {
    type: mongoose.Types.ObjectId,
    ref: 'UserRole',
    required: true,
  },
});

rolePermissionSchema.set('versionKey', 'version');
rolePermissionSchema.plugin(updateIfCurrentPlugin);
rolePermissionSchema.statics.build = (attrs: RolePermissionAttrs) => {
  return new RolePermission({
    _id: attrs.id,
    permission: attrs.permission,
    userRole: attrs.userRole,
  });
};

rolePermissionSchema.statics.checkPermissionByRoleId = async (id: string) => {
  const rolePS = await RolePermission.find({ userRole: id }).populate(
    'permission',
    // return data
    'name systemName'
  );
  if (!rolePS) return [];
  const pers: any = [];
  rolePS.forEach((rp) => pers.push(rp.permission.systemName));
  return pers;
};
rolePermissionSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  const rolePer = await RolePermission.findOne({
    _id: event.id,
    version: event.version,
  });
  if (!rolePer) throw new NotFoundError('Role-Permission');
  return rolePer;
};
const RolePermission = mongoose.model<RolePermissionDoc, RolePermissionModel>(
  'RolePermission',
  rolePermissionSchema
);
export { RolePermission };
