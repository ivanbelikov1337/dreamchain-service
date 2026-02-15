import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  
  app.enableCors({
    origin: '*',
    credentials: false,
  })

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('DreamChain API')
    .setDescription('DreamChain - Platform of Dreams on Crypto. Complete API documentation.')
    .setVersion('1.0.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Dreams', 'Dream management endpoints')
    .addTag('Donations', 'Donation endpoints')
    .addTag('Blockchain', 'Blockchain integration endpoints')
    .addServer('http://localhost:3001', 'Development Server')
    
  if (process.env.RENDER_EXTERNAL_URL) {
    config.addServer(process.env.RENDER_EXTERNAL_URL, 'Production Server')
  } else if (process.env.API_URL) {
    config.addServer(process.env.API_URL, 'Production Server')
  }
  
  const configBuild = config.build()

  const document = SwaggerModule.createDocument(app, configBuild)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const port = process.env.PORT || 3001
  await app.listen(port)
  
  console.log(`✨ DreamChain Backend listening on port ${port}`)
  console.log(`📚  Swagger docs available at http://localhost:${port}/api/docs`)
}

bootstrap()
