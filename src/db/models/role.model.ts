import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Image, { IImageDocument} from './image.model.js';

interface IRole {
  discordId: string,
  name?: string | null
  points?: number | null
  image?: Types.ObjectId | null
}

interface IRoleDocument extends IRole, Document {
  getDiscordId: () => string
  setDiscordId: (discordId: string) => void
  getName: () => string
  setName: (name: string) => void 
  getPoints: () => number
  setPoints: (points: number) => void
  getImage: () => Types.ObjectId,
  setImage: (image: Types.ObjectId) => void
  getImageDoc: () => Promise<IImageDocument | null>
}

interface IRoleModel extends Model<IRoleDocument> {
  findRole: (discordId: string) => Promise<IRoleDocument | null>;
  findRolesByPoints: (points: number) => Promise<[IRoleDocument[], IRoleDocument[]]>;
}

const RoleSchema:Schema<IRoleDocument> = new Schema({
  discordId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    default: null,
  },
  points: {
    type: Number,
    default: null,
  },
  image: {
    type: Schema.Types.ObjectId,
    default: null,
  }
});

RoleSchema.methods.getDiscordId = function() {
  return this.discordId
};

RoleSchema.methods.setDiscordId = function (id: string) {
  this.discordId = id;
};

RoleSchema.methods.getName = function() {
  return this.name;
};

RoleSchema.methods.setName = function (name: string) {
  this.name = name;
};

RoleSchema.methods.getPoints = function() {
  return this.points;
};

RoleSchema.methods.setPoints = function (points: number) {
  if (points < 0) throw new Error('Points can not be below 0');
  this.points = points;
};

RoleSchema.methods.getImage = function () {
  return this.image;
};

RoleSchema.methods.setImage = function(image: Types.ObjectId) {
  this.image = image;
};

RoleSchema.methods.getImageDoc = async function() {
  return Image.findById(this.image);
}

RoleSchema.statics.findRole = async function(discordId) {
  return this.findOne({ discordId });
};

RoleSchema.statics.findRolesByPoints = async function(points: number) {
  const all = await Role.find({});
  let levels = all.filter((role) => typeof(role.points) === 'number');
  levels = levels.sort((a, b) => a.points - b.points);
  const goodLevels = []; // earned levels
  const badLevels = []; // levels that should be removed
  levels.forEach((level) => points >= level.points ? goodLevels.push(level) : badLevels.push(level));
  return [goodLevels, badLevels]
};

const Role = mongoose.model<IRoleDocument, IRoleModel>('Role', RoleSchema);

export default Role;