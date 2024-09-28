import { BadRequestError, NotFoundError } from '@share-package/common';
import mongoose, { mongo } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { AccountDoc } from './account';
interface AccountRoleAttrs {
  id: string;
  account: AccountDoc;
  role: string;
}
interface PopulateDoc {
  id: string;
  account: string;
  roleId: string;
  userRole: string;
}
interface AccountRoleDoc extends mongoose.Document {
  id: string;
  account: AccountDoc;
  role: string;
  version: number;
}

interface AccountRoleModel extends mongoose.Model<AccountRoleDoc> {
  build(attrs: AccountRoleAttrs): AccountRoleDoc;
  checkRoleByUserId(id: string): Promise<PopulateDoc | null>;
}

const accountRoleSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

accountRoleSchema.set('versionKey', 'version');
accountRoleSchema.plugin(updateIfCurrentPlugin);

accountRoleSchema.statics.build = (attrs: AccountRoleAttrs) => {
  return new AccountRole({
    _id: attrs.id,
    account: attrs.account,
    role: attrs.role,
  });
};
const AccountRole = mongoose.model<AccountRoleDoc, AccountRoleModel>(
  'AccountRole',
  accountRoleSchema
);

export { AccountRole };
