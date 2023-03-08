import { Schema } from 'mongoose';
import { RoleType } from '../../constants/roles.js';

interface IGuildRole {
  name: string,
  discordId: string,
  image?: string,
  type?: RoleType,
  points: number | null,
}

interface ILevels {
  add: IGuildRole[],
  remove: IGuildRole[]
}

const GuildRoleSchema:Schema<IGuildRole> = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  type: {
    type: String,
  },
  discordId: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: String
  },
  points: {
    type: Number,
    validate: {
      async validator(points: number) {
        return points >= 0;
      },
      message: 'Points can not be below 0.',
    },
  }
});

export { IGuildRole, ILevels, GuildRoleSchema };