import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/roles.guard';
import { DatabaseConfigService } from './config/database.config';
import { CounselModule } from './counsel/counsel.module';
import { LoginModule } from './login/login.module';
import { MainController } from './main.controller';
import { ScoresModule } from './scores/score.module';
import { StudentModule } from './students/student.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { ParentModule } from './parents/parent.module';
import { TeacherModule } from './teachers/teacher.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    UserModule,
    AuthModule,
    LoginModule,
    UploadModule,
    StudentModule,
    AttendanceModule,
    CounselModule,
    ScoresModule,
    ParentModule,
    TeacherModule,
  ],
  controllers: [AppController, MainController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
