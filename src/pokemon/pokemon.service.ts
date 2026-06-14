import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>
  ) { }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this._handleException(error);
    }
  }

  async insertManyPokemons(createPokemonsDto: CreatePokemonDto[]) {
    try {
      const insertedPokemons = await this.pokemonModel.insertMany(createPokemonsDto);
      return insertedPokemons;
    } catch (error) {
      this._handleException(error);
    }
  }

  async findAll() {
    const pokemons = await this.pokemonModel.find();
    return pokemons;
  }

  async findOne(id: string) {

    let pokemon: Pokemon | null = null;

    if (!isNaN(Number(id))) {
      pokemon = await this.pokemonModel.findOne({ no: Number(id) });
    }

    if (isValidObjectId(id) && !pokemon) {
      pokemon = await this.pokemonModel.findById(id);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: id });
    }

    if (!pokemon) {
      throw new BadRequestException(`Pokemon ${id} not found`);
    }

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this._handleException(error);
    }
  }

  private _handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists in db: ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs`);
  }

  async remove(id: string) {

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon ${id} not found`);
    }

    return;
  }

  async removeAll() {
    console.log('should delete')
    await this.pokemonModel.deleteMany({});
  }
}
