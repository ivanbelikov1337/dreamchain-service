import { IsString, IsNumber, IsOptional } from 'class-validator'

export class CreateDreamDto {
  @IsOptional()
  @IsNumber()
  id?: number

  @IsNumber()
  userId: number

  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  imageUrl?: string

  @IsNumber()
  @IsOptional()
  goal?: number

  @IsString()
  @IsOptional()
  category?: string
}
