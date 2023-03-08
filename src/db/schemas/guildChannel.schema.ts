import { Schema } from 'mongoose';
import { ChannelName } from '../../constants/channels.js';

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

export { ChannelName, GuildChannelSchema, IGuildChannel };