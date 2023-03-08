import { Schema } from 'mongoose';

interface IGuildChannel {
  name: string,
  discordId: string,
}

const GuildChannelSchema:Schema<IGuildChannel> = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  discordId: {
    type: String,
    unique: true,
    required: true,
  }
});

export { GuildChannelSchema, IGuildChannel };