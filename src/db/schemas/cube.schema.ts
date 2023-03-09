import { Schema } from 'mongoose';

interface ICube {
  name?: string,
  link: string
}

const CubeSchema = new Schema<ICube>({
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

export { ICube, CubeSchema }
