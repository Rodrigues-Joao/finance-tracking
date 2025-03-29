
import { UserRepository } from "../reposittory/user-repository";
import * as bcrypt from "bcrypt"
import { User } from "../types/User";
export const UserService = {
    async getAll() 
    {
        return UserRepository.getAll()
    },
    async getById( id: number ): Promise<User>
    {
        const user = await UserRepository.getById( id )
        if ( !user ) throw new Error( "User not found" )
        return user
    },
    async create( user: User ): Promise<{ userId: number }>
    {
        const salt = await bcrypt.genSalt( 10 )
        const hash = await bcrypt.hash( user.password, salt )
        const userId = await UserRepository.create( { ...user, password: hash } )
        return { userId }
    }
}