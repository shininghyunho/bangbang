import { Controller, Get, Post, Req, Param, Body, ForbiddenException, ParseIntPipe, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { CatsService } from './cats.service';
import { RolesGuard } from 'src/roles.guard';
import { Roles } from 'src/roles.decorator';
import { LoggingInterceptor } from 'src/logging.interceptor';

@Controller('cats')
@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor)
export class CatsController {
    constructor(private readonly catsService: CatsService) {}

    @Post()
    @Roles(['admin'])
    async create(@Body() createCatDto: CreateCatDto) {
        return this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(@Req() request) {
        throw new ForbiddenException();
    }
    
    @Get(':id')
    async findOne(
        @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
        id: number,
    ) {
        return this.catsService.findOne(id);
    }
}