import { input } from "zod";
import { prisma } from "../lib/prisma";
import { User } from "../types/User";

export const UserRepository = {
    async getAll() 
    {
        const users = await prisma.user.findMany();
        return users

    },
    async getById( id: number ): Promise<User | null>
    {
        const user = await prisma.user.findFirst( {
            where: {
                id: id
            }
        } );
        if ( !user )
            return null
        return { id: id, name: user.name, email: user.email, password: user.password }
    },
    async create( user: User ): Promise<number>
    {
        const userCreate = await prisma.user.create( {
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
            }
        } );
        return userCreate.id
    }
}