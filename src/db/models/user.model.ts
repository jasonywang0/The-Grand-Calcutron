import mongoose, { Schema, Document, Model } from 'mongoose';
import { CustomError } from '../../structures/error.js';
import {ICube, CubeSchema} from '../schemas/cube.schema.js';

interface IUser {
  discordId: string,
  discordTag: string,
  points: number,
  maritLage?: boolean,
  cubes?: ICube[]
}

interface IUserDocument extends IUser, Document {
  getPoints: () => number
  setPoints: (points: number) => void
  getCubes: () => ICube[]
  setCubes: (cubes: ICube[]) => void 
  addCube: (link: string, name?: string) => void
  findCube: (link: string) => ICube | null
  deleteCube: (link: string) => void 
}

interface IUserModel extends Model<IUserDocument> {
  findUser: (discordId: string) => Promise<IUserDocument | null>;
  findUserAndUpdate: (discordId: string, payload: any) => Promise<IUserDocument>;
  findUserAndLevel: (discordId: string, amount: number) => Promise<IUserDocument>;
}

const UserSchema:Schema<IUserDocument> = new Schema({
  discordId: {
    type: String,
    unique: true,
    required: true,
  },
  discordTag: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 500,
  },
  points: {
    type: Number,
    required: true,
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
    required: true,
    default: false,
  },
  cubes: {
    required: true,
    type: [CubeSchema]
  }
});

UserSchema.methods.getPoints = function() {
  return this.points;
};

UserSchema.methods.setPoints = function (points: number) {
  if (points < 0) throw new CustomError(null, 'Points can not be below 0');
  this.points = points;
};

UserSchema.methods.getCubes = function():ICube[] {
  return this.cubes;
};

UserSchema.methods.setCubes = function(cubes: ICube[]) {
  this.cubes = cubes;
};

UserSchema.methods.addCube = function(link: string, name?: string) {
  try {
    const url = new URL(link); // can throw an error if the link is not complete
    if (url.hostname !== 'cubecobra.com' && url.hostname !== 'cubeartisan.net') throw new CustomError('CUBE_PARSE_1');
    const cubes = this.getCubes();
    if (cubes.length > 5) throw new CustomError('USER_CUBE_LIMIT_1');  
    cubes.push({link, name});
  } catch (e) {
    if (e.code === 'ERR_INVALID_URL') throw new CustomError('CUBE_PARSE_1');
    throw e;
  }
}

UserSchema.methods.findCube = function(link: string) {
  const cube = this.cubes.find((cube:ICube) => cube.link.toLowerCase() === link.toLowerCase());
  if (!cube) throw new Error('Cube could not be found!');
  return cube;
}

UserSchema.methods.deleteCube = function(link: string) {
  const index = this.cubes.findIndex((cube:ICube) => cube.link.toLowerCase() === link.toLowerCase());
  if (index >= 0) this.cubes.splice(index, 1);
}

UserSchema.statics.findUser = async function(discordId): Promise<IUserDocument | null> {
  return this.findOne({ discordId });
};

UserSchema.statics.findUserAndUpdate = async function(discordId, payload)  {
   return await this.findOneAndUpdate(  { discordId }, payload, { upsert: true, returnOriginal: false, runValidators: true, strict: true } )
};

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export { User, IUser, IUserDocument };