import { ProcessedImage } from '@/common/pipes/sharp.pipe';
import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
config();

@Injectable()
export class UploadRafflePhotosService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadPhotos(files: ProcessedImage[]): Promise<string[]> {
    const filesUrl: string[] = [];
    for (const file of files) {
      const fileData = `data:image/jpeg;base64,${file.buffer.toString('base64')}`;
      const data = await cloudinary.uploader.upload(fileData);
      filesUrl.push(data.secure_url);
    }
    return filesUrl;
  }

  async deletePhoto(photoUrl: string) {
    // the cloudinary url generated are always in the following format
    // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<format>
    // and we need to extract the public_id to delete the image
    const publicId = photoUrl.split('/')[7].split('.')[0];
    await cloudinary.uploader.destroy(publicId);
    return true;
  }
}
