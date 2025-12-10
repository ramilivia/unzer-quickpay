import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App Module')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check - Check if the server is online' })
  @ApiOkResponse({
    description: 'Server is running and online',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        message: {
          type: 'string',
          example: 'Server is online',
        },
      },
    },
  })
  getHealth(): { status: string; message: string } {
    return this.appService.getHealth();
  }
}
