import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";

@Injectable()
export class AxiosAdapter {
    private readonly axios: AxiosInstance;

    constructor() {
        this.axios = axios.create();
    }

    async get<T>(url: string): Promise<T> {
        try {
            const response = await this.axios.get<T>(url);
            return response.data;
        } catch (error) {
            console.log(error);
            throw new Error(`Error retrieve information: ${error}`);
        }
    }
}
