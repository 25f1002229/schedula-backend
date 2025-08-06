import { Controller, Get } from '@nestjs/common';

@Controller()
export class HelloController {
  @Get()
  getHello(): string {
    return 'Hello World! Welcome to Schedula Backend!';
  }
}
