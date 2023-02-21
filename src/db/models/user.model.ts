import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser {
  discordId: string,
  discordTag: string,
  points: number,
  maritLage?: boolean,
  cubes?: Cube[]
}

interface IUserDocument extends IUser, Document {
  getPoints: () => number
  setPoints: (points: number) => void
  getCubes: () => Cube[]
  setCubes: (cubes: Cube[]) => void 
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

UserSchema.methods.getPoints = function() {
  return this.points;
};

UserSchema.methods.setPoints = function (points: number) {
  if (points < 0) throw new Error('Points can not be below 0');
  this.points = points;
};

UserSchema.methods.getCubes = function() {
  return this.cubes;
};

UserSchema.methods.setCubes = function(cubes: Cube[]) {
  this.cubes = cubes;
};


UserSchema.statics.findUser = async function(discordId) {
  return this.findOne({ discordId });
};

UserSchema.statics.findUserAndUpdate = async function(discordId, payload)  {
   return await this.findOneAndUpdate(  { discordId }, payload, { upsert: true, returnOriginal: false, runValidators: true, strict: true } )
};

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
export default User;