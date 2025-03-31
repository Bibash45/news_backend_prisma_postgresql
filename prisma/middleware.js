import {
    PrismaClient
} from '@prisma/client';
import bcrypt from 'bcrypt';



const prisma = new PrismaClient({
    log: ['query'],

});

// Hash password before saving to DB
prisma.$use(async (params, next) => {
    if (params.model === "User" && params.action === "create") {
        const salt = await bcrypt.genSalt(10);
        params.args.data.password = await bcrypt.hash(params.args.data.password, salt);
    }
    return next(params);
});

export default prisma;