import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: ['name must be a string', 'name should not be empty', 'country must be a string'],
    description: 'Array of validation error messages',
    type: [String],
  })
  message: string[];

  @ApiProperty({
    example: 'Bad Request',
    description: 'Error type',
  })
  error: string;
}
