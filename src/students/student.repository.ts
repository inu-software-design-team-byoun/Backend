import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepo.find();
  }

  async findOneById(id: number): Promise<Student> {
    return this.studentRepo.findOneByOrFail({ id });
  }

  async createStudent(dto: Partial<Student>): Promise<Student> {
    const student = this.studentRepo.create(dto);
    return this.studentRepo.save(student);
  }

  async updateStudent(id: number, dto: Partial<Student>): Promise<Student> {
    await this.studentRepo.update(id, dto);
    return this.findOneById(id);
  }

  async deleteStudent(id: number): Promise<void> {
    await this.studentRepo.delete(id);
  }
}
