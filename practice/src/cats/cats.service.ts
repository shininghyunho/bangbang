import { Injectable, Param, ParseIntPipe } from "@nestjs/common";
import { Cat } from "./interfaces/cat.interface";
import { CreateCatDto } from "./dto/create-cat.dto";

@Injectable()
export class CatsService {
    private readonly cats: Cat[] = [];

    create(catDto: CreateCatDto) {
        const cat: Cat = {
            name: catDto.name,
            age: catDto.age,
            breed: catDto.breed
        };
        this.cats.push(cat);
    }
    
    findAll(): Cat[] {
        return this.cats;
    }
    
    findOne(id: number): Cat {
        return this.cats[id];
    }
}
