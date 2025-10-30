import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>,
    ) {}

    async findById(id: bigint): Promise<User | null> {
        return this.repository.findOneBy({ id });
    }

    async save(user: User): Promise<User> {
        return this.repository.save(user);
    }
}