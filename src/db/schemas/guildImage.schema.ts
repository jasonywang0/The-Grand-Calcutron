import { Schema } from 'mongoose';

interface IGuildImage {
  name: string,
  link: string
};

const GuildImageSchema:Schema<IGuildImage> = new Schema({
  name: {
    type: String
  },
  link: {
    type: String
  }
})

export { IGuildImage, GuildImageSchema };