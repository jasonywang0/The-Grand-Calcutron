import mongoose, { Schema, Document, Model } from 'mongoose';
import { GuildRoleSchema, IGuildRole, ILevels } from '../schemas/guildRole.schema.js';
import { IGuildChannel, GuildChannelSchema } from '../schemas/guildChannel.schema.js';
import { IGuildImage, GuildImageSchema } from '../schemas/guildImage.schema.js';
import { RoleType } from '../../constants/roles.js';
import { ChannelName } from '../../constants/channels.js';
import { ImageName } from '../../constants/images.js';
import { CustomError } from '../../structures/error.js';

interface IGuild {
  discordId: string,
  adminDiscordId: string, 
  roles: IGuildRole[],
  channels: IGuildChannel[],
  images?: IGuildImage[]
}

interface IGuildDocument extends IGuild, Document {
  getDiscordId: () => string,
  setDiscordId: (discordId: string) => void,
  getAdminDiscordId: () => string
  setAdminDiscordId: (discordId: string) => void
  getRoles: () => IGuildRole[]
  getRolesByType: (type: RoleType) => IGuildRole[] | null
  getLevelsByPoints: (points: number) => ILevels
  getChannels: () => IGuildChannel[]
  getChannelByName: (name: ChannelName) => IGuildChannel | null
  getImages: () => IGuildImage[]
  getImageByName: (name: ImageName) => IGuildImage | null;
  addImages: (image: IGuildImage) => void;
}

interface IGuildModel extends Model<IGuildDocument> {
  findByDiscordId: (discordId: string) => Promise<IGuildDocument>;
}

const GuildSchema:Schema<IGuildDocument> = new Schema({
  discordId: {
    type: String,
    unique: true,
    required: true,
  },
  adminDiscordId: {
    type: String,
    unique: true,
    required: true,
  },
  roles: [GuildRoleSchema],
  channels: [GuildChannelSchema],
  images: [GuildImageSchema]
});

GuildSchema.methods.getDiscordId = function(): string {
  return this.discordId
};

GuildSchema.methods.setDiscordId = function(discordId: string) {
  this.discordId = discordId;
};

GuildSchema.methods.getAdminDiscordId = function(): string {
  return this.adminDiscordId
};

GuildSchema.methods.setAdminDiscordId = function(discordId: string) {
  this.adminDiscordId = discordId
};

GuildSchema.methods.getRoles = function(): IGuildRole[] {
  return this.roles;
};

GuildSchema.methods.getChannels = function(): IGuildChannel[] {
  return this.channels;
};

GuildSchema.methods.getImages = function(): IGuildImage[] {
  return this.images;
};

GuildSchema.methods.addImages = function(image: IGuildImage) {
  this.images.push(image);
};

GuildSchema.methods.getImageByName = function(name: ImageName) {
  const images = this.getImages();
  const image = images.find((image: IGuildImage) => image.name === name);
  if (!image) throw new CustomError(null, 'Image not found!');
  return image;
};

GuildSchema.methods.getRolesByType = function(type: RoleType) {
  const roles = this.getRoles();
  const foundRoles = roles.filter((role: IGuildRole) => role.type === type);
  if (!foundRoles.length) throw new CustomError(null, 'No roles found!');
  return foundRoles;
};

GuildSchema.methods.getLevelsByPoints = function(points: number): ILevels {
  const roles = this.getRoles();
  let allLevels = roles.filter((role: IGuildRole) => role.type === RoleType.Level);
  if (!allLevels.length) throw new CustomError(null, 'No levels registered!');
  allLevels = allLevels.sort((a, b) => a.points - b.points);
  const levels: ILevels = {
    add: [],
    remove: []
  };
  allLevels.forEach((role:IGuildRole) => points >= role.points ? levels.add.push(role) : levels.remove.push(role));
  return levels;
}

GuildSchema.methods.getChannelByName = function(name: ChannelName) {
  const channels = this.getChannels();
  const channel = channels.find((c) => c.name === name);
  if (!channel) throw new CustomError(null, 'Registered Channel could not be found!');
  return channel;
}

GuildSchema.statics.findByDiscordId = async function(discordId: string) {
  const guild = await this.findOne({discordId});
  if (!guild) throw new CustomError(null, 'No Guild found!');
  return guild;
};

const Guild = mongoose.model<IGuildDocument, IGuildModel>('Guild', GuildSchema);

export { Guild };