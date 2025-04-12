import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scores } from './score.entity';
import { Student } from '../students/student.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreByIdDto } from './dto/update-score.dto';
import { GetScoreDto } from './dto/get-score.dto';
import { GetClassScoreDto } from './dto/get-class-score.dto';

interface ClassScoreResult {
  studentId: number;
  name: string;
  grade: number;
  class: number;
  semester: number;
  subjects: {
    subject1: number;
    subject2: number;
    subject3: number;
    subject4: number;
    subject5: number;
    subject6: number;
    subject7: number;
    subject8: number;
  };
  totalScore: number;
  averageScore: number;
}

@Injectable()
export class ScoresService {
  constructor(
    @InjectRepository(Scores)
    private scoresRepository: Repository<Scores>,

    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  private calculateTotalAndAverage(score: Partial<Scores>) {
    const subjects = [
      score.subject1,
      score.subject2,
      score.subject3,
      score.subject4,
      score.subject5,
      score.subject6,
      score.subject7,
      score.subject8,
    ];

    const validScores = subjects.filter((subject) => subject !== undefined && subject !== null);
    const total = validScores.reduce((sum, subject) => sum + subject, 0);
    const average = validScores.length > 0 ? total / validScores.length : 0;

    return { total, average };
  }

  async createScore(dto: CreateScoreDto) {
    const { studentId, grade, semester, ...subjects } = dto;

    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('해당 학생을 찾을 수 없습니다.');
    }

    let score = await this.scoresRepository.findOne({
      where: { student: { id: studentId }, grade, semester },
      relations: ['student'],
    });

    const now = new Date();

    if (!score) {
      score = this.scoresRepository.create({
        id: studentId,
        grade,
        semester,
        createdAt: now,
        updatedAt: now,
        ...subjects,
      });
    } else {
      Object.assign(score, subjects);
      score.updatedAt = now;
    }

    const { total, average } = this.calculateTotalAndAverage(score);
    score.totalScore = total;
    score.averageScore = average;

    await this.scoresRepository.save(score);

    return {
      message: score.createdAt === now ? '성적 정보가 성공적으로 생성되었습니다.' : '성적 정보가 성공적으로 업데이트되었습니다.',
      updatedScore: {
        studentId,
        grade,
        semester,
        subjects: {
          subject1: score.subject1,
          subject2: score.subject2,
          subject3: score.subject3,
          subject4: score.subject4,
          subject5: score.subject5,
          subject6: score.subject6,
          subject7: score.subject7,
          subject8: score.subject8,
        },
        total,
        average,
      },
    };
  }

  async updateScore(scoreId: number, updateDto: UpdateScoreByIdDto) {
    const score = await this.scoresRepository.findOne({ 
      where: {
        student: {
          id: scoreId,
        },
      },
      relations: ['student'],
    });
    if (!score) {
      throw new NotFoundException('해당 성적 정보를 찾을 수 없습니다.');
    }

    Object.assign(score, updateDto);
    score.updatedAt = new Date();

    const { total, average } = this.calculateTotalAndAverage(score);
    score.totalScore = total;
    score.averageScore = average;

    const updatedScore = await this.scoresRepository.save(score);

    return {
      message: '성적 정보가 성공적으로 업데이트되었습니다.',
      updatedScore: {
        id: updatedScore.id,
        studentId: updatedScore.student.id,
        grade: updatedScore.grade,
        semester: updatedScore.semester,
        subjects: {
          subject1: updatedScore.subject1,
          subject2: updatedScore.subject2,
          subject3: updatedScore.subject3,
          subject4: updatedScore.subject4,
          subject5: updatedScore.subject5,
          subject6: updatedScore.subject6,
          subject7: updatedScore.subject7,
          subject8: updatedScore.subject8,
        },
        totalScore: updatedScore.totalScore,
        averageScore: updatedScore.averageScore,
      },
    };
  }

  async getStudentScore(query: GetScoreDto) {
    const { studentId, semester } = query;

    const student = await this.studentRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('해당 학생을 찾을 수 없습니다.');
    }

    const score = await this.scoresRepository.find({ 
      where: { 
        student: { id: studentId },
        semester,
      },
      relations: ['student'],
    });

    if (!score || score.length === 0) {
      throw new NotFoundException('해당 학생의 성적 정보를 찾을 수 없습니다.');
    }

    const response = score.map((score) => ({
      semester: score.semester,
      grade: score.grade,
      subjects: {
        subject1: score.subject1,
        subject2: score.subject2,
        subject3: score.subject3,
        subject4: score.subject4,
        subject5: score.subject5,
        subject6: score.subject6,
        subject7: score.subject7,
        subject8: score.subject8,
      },
      totalScore: score.totalScore,
      averageScore: score.averageScore,
    }));

    return {
      message: '학생의 성적 정보를 조회하였습니다.',
      studentId: student.id,
      studentNum: student.studentNum.toString(),
      studentName: student.name,
      grade: student.grade,
      scores: response,
    };
  }

  async getClassScore(query: GetClassScoreDto) {
    const { grade, semester, class: classNum } = query;

    const students = await this.studentRepository.find({ where: { grade, class: classNum } });

    const result: ClassScoreResult[] = [];

    for (const student of students) {
      const score = await this.scoresRepository.findOne({ 
        where: {
          student: {
            id: student.id,
          },
          grade,
          semester,
        },
        relations: ['student'],
      });

      if (!score) continue;

      result.push({
        studentId: student.id,
        name: student.name,
        grade: student.grade,
        class: student.class,
        semester: score.semester,
        subjects: {
          subject1: score.subject1,
          subject2: score.subject2,
          subject3: score.subject3,
          subject4: score.subject4,
          subject5: score.subject5,
          subject6: score.subject6,
          subject7: score.subject7,
          subject8: score.subject8,
        },
        totalScore: score.totalScore,
        averageScore: score.averageScore,
      });
    }

    return {
      message: '학생의 성적 정보를 조회하였습니다.',
      students: result,
    };
  }

  async deleteScore(scoreId: number) {
    const deletedScore = await this.scoresRepository.delete(scoreId);

    if (deletedScore.affected === 0) {
      throw new NotFoundException('해당 성적 정보를 찾을 수 없습니다.');
    }

    return {
      message: '성적 정보가 성공적으로 삭제되었습니다.',
    };
  }
}
