import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

const ParseImagesPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 10, message: 'file-exceeded-10mb-limit' }),
    new FileTypeValidator({
      fileType: /(jpg|jpeg|png|gif)$/,
    }),
  ],
});

export default ParseImagesPipe;
