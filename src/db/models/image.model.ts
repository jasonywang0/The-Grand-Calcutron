import mongoose, { Schema, Document, Model } from 'mongoose';

interface IImage {
  name: string,
  link: string,
  meta?: string,
}

export interface IImageDocument extends IImage, Document {
  getName: () => string
  setName: (name: string) => void 
  getLink: () => string,
  setLink: (link: string) => void
  getMeta: () => string
  setMeta: (meta: string) => void
}

interface IImageModel extends Model<IImageDocument> {
  findByName: (name: string) => Promise<IImageDocument>;
}

const ImageSchema:Schema<IImageDocument> = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    trim: true,
  },
  meta: {
    type: String,
    trim: true,
    default: null,
  }
});

ImageSchema.methods.getName = function() {
  return this.name;
};

ImageSchema.methods.setName = function (name: string) {
  this.name = name;
};

ImageSchema.methods.getLink = function () {
  return this.link;
};

ImageSchema.methods.setLink = function(link: string) {
  this.link = link;
};

ImageSchema.methods.getMeta = function () {
  return this.meta;
};

ImageSchema.methods.setMeta = function(meta: string) {
  this.meta = meta;
};

ImageSchema.statics.findByName = async function(name: string) {
  return this.findOne({ name });
};

const Image = mongoose.model<IImageDocument, IImageModel>('Image', ImageSchema);

export default Image;