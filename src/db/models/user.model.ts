import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser {
  discordId: string,
  discordTag: string,
  points: number,
  maritLage?: boolean,
  cubes?: Cube[]
}

interface IUserDocument extends IUser, Document {
  getPoints: () => Promise<number>
  setPoints: (points: number) => Promise<void>
  getCubes: () => Promise<Cube[]>
}

interface IUserModel extends Model<IUserDocument> {
  findUser: (discordId: string) => Promise<IUserDocument>;
  findUserAndUpdate: (discordId: string, payload: any) => Promise<IUserDocument>;
  findUserAndLevel: (discordId: string, amount: number) => Promise<IUserDocument>;
}

interface Cube {
  name: string,
  link: string
}

const CubeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    max: 2000,
    validate: {
      async validator(value: string) {
        return new URL(value).hostname === 'cubecobra.com';
      },
      message: 'Cube URL must be from CubeCobra!',
    },
  },
});

const UserSchema:Schema<IUserDocument> = new Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  discordTag: {
    type: String,
    minlength: 1,
    maxlength: 255,
    trim: true,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      async validator(value: number) {
        return value >= 0;
      },
      message: 'Points can not be below 0.',
    },
  },
  maritLage: {
    type: Boolean,
    default: false,
  },
  cubes: {
    type: [CubeSchema]
  }
},  {strictQuery: false});

UserSchema.methods.getPoints = async function() {
  return this.points;
};

UserSchema.methods.setPoints = async function (points: number) {
  if (points < 0) throw new Error('Points can not be below 0');
  this.points = points;
  this.save();
};

UserSchema.methods.getCubes = async function() {
  return this.cubes;
};

UserSchema.statics.findUser = function(discordId) {
  return this.findOne({ discordId });
};

UserSchema.statics.findUserAndUpdate = function(discordId, payload)  {
   return this.findOneAndUpdate({ discordId }, payload, { upsert: true, returnOriginal: false, runValidators: true, strict: true })
};

UserSchema.statics.findUserAndLevel = async function (discordId, amount) {
  const payload = { $inc: { points: amount } };
  const user = await User.findUserAndUpdate(discordId, payload);
  return user;
};

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
export default User;