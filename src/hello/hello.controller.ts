import { Controller, Get } from '@nestjs/common';

@Controller()
export class HelloController {
  @Get()
  getHello(): { message: string } {
    return { message: 'Hello World! Welcome to Schedula Backend!' };
  }
}
