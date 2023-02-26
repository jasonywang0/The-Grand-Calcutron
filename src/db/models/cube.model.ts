import mongoose, { Schema, Document, Model } from 'mongoose';

interface ICube {
  name?: string,
  link: string
}

interface ICubeDocument extends ICube, Document {
  getName: () => string
  setName: (name: string) => void
  getLink: () => string 
  setLink: (link: string) => void
}

interface ICubeModel extends Model<ICubeDocument> {
  // TODO: Add methods to search
}

const CubeSchema = new Schema<ICubeDocument>({
  name: {
    required: false,
    type: String,
  },
  link: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    max: 2000,
  },
});

const Cube = mongoose.model<ICubeDocument, ICubeModel>('Cube', CubeSchema)

export type { ICube, ICubeDocument, ICubeModel }
export { Cube, CubeSchema };