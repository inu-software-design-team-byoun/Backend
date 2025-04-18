import { IsEnum, IsOptional, IsDateString, IsInt } from 'class-validator';
import { AttendanceStatus } from '../attendance.entity';

export class UpdateAttendanceDto {
  @IsInt()
  @IsOptional()
  studentId?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(AttendanceStatus)
  @IsOptional()
  status?: AttendanceStatus;

  @IsOptional()
  note?: string;
}