import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return { status: 'ok', message: 'DreamChain Backend is running' }
  }

  @Get()
  root() {
    return {
      name: 'DreamChain API',
      version: '0.1.0',
      description: 'Platform of Dreams on Crypto',
    }
  }
}
