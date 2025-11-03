import { Injectable } from '@nestjs/common';
import { Provider } from '../entities/provider.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProviderRepository {
  constructor(
    @InjectRepository(Provider)
    private readonly repository: Repository<Provider>,
  ) {}

  async findById(id: number): Promise<string | null> {
    const provider = await this.repository.findOneBy({ id });
    return provider ? provider.name : null;
  }

  async findByName(name: string): Promise<Provider | null> {
    return this.repository.findOneBy({ name });
  }
}
