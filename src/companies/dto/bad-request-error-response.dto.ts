import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Validation failed (numeric string is expected)',
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
  })
  error: string;
}
