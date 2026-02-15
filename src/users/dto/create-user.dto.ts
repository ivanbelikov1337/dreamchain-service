import { IsString, IsOptional } from 'class-validator'

export class CreateUserDto {
  @IsString()
  walletAddress: string

  @IsString()
  @IsOptional()
  username?: string

  @IsString()
  @IsOptional()
  avatar?: string
}
