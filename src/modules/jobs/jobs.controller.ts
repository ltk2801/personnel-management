import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Get all jobs
  @ApiOperation({ summary: 'Lay danh sach job' })
  @ApiOkResponse({ description: 'Lay danh sach job thanh cong' })
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  // Get a single job by id
  @ApiOperation({ summary: 'Lay chi tiet mot job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiOkResponse({ description: 'Lay chi tiet job thanh cong' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  // Create a new job
  @ApiOperation({ summary: 'Tao job moi' })
  @ApiBody({ type: Job })
  @ApiOkResponse({ description: 'Tao job thanh cong' })
  @Post()
  create(@Body() job: Job) {
    return this.jobsService.create(job);
  }

  // Update a job
  @ApiOperation({ summary: 'Cap nhat job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ type: Job })
  @ApiOkResponse({ description: 'Cap nhat job thanh cong' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() job: Job) {
    return this.jobsService.update(id, job);
  }

  // Delete a job
  @ApiOperation({ summary: 'Xoa job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiOkResponse({ description: 'Xoa job thanh cong' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }
}
