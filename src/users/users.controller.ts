import { Controller, Get, Param, Post, Put, Body, HttpCode, BadRequestException } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.walletAddress) {
      throw new BadRequestException('Wallet address is required')
    }
    
    try {
      return await this.usersService.create(createUserDto)
    } catch (error: any) {
      console.error('Error creating user:', error)
      if (error.code === 'P2002') {
        throw new BadRequestException('User with this wallet already exists')
      }
      throw error
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id, 10))
  }

  @Get('wallet/:address')
  async findByWallet(@Param('address') address: string) {
    const user = await this.usersService.findByWalletAddress(address)
    if (!user) {
      return null
    }
    return user
  }

  @Get('wallet/:address/dreams/created')
  async getCreatedDreams(@Param('address') address: string) {
    return this.usersService.getCreatedDreams(address)
  }

  @Get('wallet/:address/dreams/donated')
  async getDonatedDreams(@Param('address') address: string) {
    return this.usersService.getDonatedDreams(address)
  }

  @Get('wallet/:address/dreams/completed')
  async getCompletedDreams(@Param('address') address: string) {
    return this.usersService.getCompletedDreams(address)
  }

  @Post(':id/update-rating')
  updateRating(@Param('id') id: string) {
    return this.usersService.updateRating(parseInt(id, 10))
  }

  @Put('wallet/:address')
  async updateByWallet(
    @Param('address') address: string,
    @Body() data: { username: string },
  ) {
    if (!data.username) {
      throw new BadRequestException('Username is required')
    }
    return this.usersService.updateUsername(address, data.username)
  }
}
