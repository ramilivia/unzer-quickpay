import { ApiProperty } from '@nestjs/swagger';

export class ServiceErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'A base plan is required when creating relative pricings',
    description: 'Business logic validation error message',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
  })
  error: string;
}
