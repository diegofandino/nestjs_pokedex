import { Injectable } from '@nestjs/common';
import { AxiosAdapter } from 'src/adapters/axios.adapter';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  constructor(
    private readonly http: AxiosAdapter,
    private readonly pokemonService: PokemonService,
  ) { }

  async executeSeed() {

    // delete all data before insert seed.
    await this.pokemonService.removeAll();


    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=100&offset=0');


    const insertPromises: CreatePokemonDto[] = [];

    data.results.forEach(({ name, url }) => {
      const splitUrl = url.split('/');
      const no = Number(splitUrl[splitUrl.length - 2]);

      const pokemon: CreatePokemonDto = {
        name,
        no,
      }

      insertPromises.push(pokemon);


    });

    await this.pokemonService.insertManyPokemons(insertPromises);
    return;
  }
}
