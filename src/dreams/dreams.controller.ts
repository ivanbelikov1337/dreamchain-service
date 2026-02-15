import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { DreamsService } from './dreams.service'
import { CreateDreamDto } from './dto/create-dream.dto'

@Controller('dreams')
export class DreamsController {
  constructor(private dreamsService: DreamsService) {}

  @Post()
  create(@Body() createDreamDto: CreateDreamDto) {
    return this.dreamsService.create(createDreamDto)
  }

  @Get()
  findAll(@Query('skip') skip = '0', @Query('take') take = '10') {
    return this.dreamsService.findAll(parseInt(skip), parseInt(take))
  }

  @Get('top')
  findTop(@Query('limit') limit = '10') {
    return this.dreamsService.findTop(parseInt(limit))
  }

  @Get('stats')
  getStats() {
    return this.dreamsService.getStats()
  }

  @Get('next-id')
  getNextId() {
    return this.dreamsService.getNextId()
  }

  @Get('new')
  findNew(@Query('limit') limit = '10') {
    return this.dreamsService.findNew(parseInt(limit))
  }

  @Get('random')
  findRandom() {
    return this.dreamsService.findRandom()
  }

  @Get('completed')
  findCompleted(@Query('limit') limit = '10') {
    return this.dreamsService.findCompleted(parseInt(limit))
  }

  @Post(':id/withdraw')
  withdrawFunds(@Param('id') id: string) {
    return this.dreamsService.withdrawFunds(parseInt(id, 10))
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.dreamsService.findByUserId(parseInt(userId, 10))
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dreamsService.findById(parseInt(id, 10))
  }
}
