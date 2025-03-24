import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { UploadService } from './upload.service';
  
  @Controller('upload')
  export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
  
    @Post('image')
    @UseInterceptors(FileInterceptor('file')) 
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
      const result = await this.uploadService.uploadFileToS3(file);
      return { imageUrl: result.url }; 
    }
  }