import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

export interface ProcessedImage {
  filename: string;
  buffer: Buffer;
}

@Injectable()
export class SharpPipe
  implements
    PipeTransform<
      Express.Multer.File[] | Express.Multer.File,
      Promise<ProcessedImage[]>
    >
{
  async transform(
    images: Express.Multer.File[] | Express.Multer.File,
  ): Promise<ProcessedImage[] | Express.Multer.File[]> {
    const files = [] as ProcessedImage[];
    if (!Array.isArray(images)) images = [images];

    if (images.some((image) => !image.mimetype.includes('image')))
      return images as Express.Multer.File[];

    for (const image of images) {
      const filename = uuid().toString() + '.webp';

      const processedBuffer = await sharp(image.buffer)
        .clone()
        .jpeg()
        .toBuffer();

      files.push({ filename, buffer: processedBuffer });
    }

    return files;
  }
}
