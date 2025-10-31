import { Injectable } from "@nestjs/common";
import { OauthAccount } from "../entities/oauth_account.entity";
import { FindOneOptions, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OauthAccountRepository {
    constructor(
        @InjectRepository(OauthAccount)
        private readonly repository: Repository<OauthAccount>,
    ) {}

    async save(oauthAccount: OauthAccount): Promise<OauthAccount> {
        return this.repository.save(oauthAccount);
    }

    async findByProvider(providerId: number, providerUserId: string): Promise<OauthAccount | null> {
        const options: FindOneOptions<OauthAccount> = {
            where: { providerId, providerUserId },
        };
        return this.repository.findOne(options);
    }
}