import { PrismaClient } from "@prisma/client";

const prisma_connect = new PrismaClient({
  log: ["query"],
});

export default prisma_connect;