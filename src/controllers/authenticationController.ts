import { Request, Response, NextFunction } from "express";
import UserService from "../services/userService";
import User from "../models/user";
import { CryptoService } from "../services/cryptoService";

const getPublicKey = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).send({ publicKey: process.env.PUBLIC_KEY });
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req. body;
    let token = '';
    let user: User | undefined;

    if ((email as string).trim() === '' || email === undefined || (password as string).trim() === '' || password === undefined)
        return res.status(500).send('Os dados de login foram informados de maneira incorreta');

    try {
        user = await UserService.getUserByMail(email);

        if (user === undefined)
            return res.status(500).send('Crednciais inválidas');

        const decryptedPassword: string = CryptoService.privateDecrypt(password);
        const hashedPasswod: string = CryptoService.hash(decryptedPassword + user.salt);

        if (hashedPasswod !== user.password)
            return res.status(500).send('Crednciais inválidas');

        token = CryptoService.generateJwtToken({ email });
    } catch (err: any) { 
        console.error(err);
        return res.status(500).send('Houve um erro ao realizar login');
    }

    const normalizedRole = user.role === 'admin' ? 'administrator' : user.role;

    return res.status(200).send({ 
        token, 
        id: user.id,
        firstName: user.firstName, 
        middleName: user.middleName, 
        lastName: user.lastName, 
        role: normalizedRole, 
        active: user.active,
        validated: user.validated
    });
}

export default { getPublicKey, login };
