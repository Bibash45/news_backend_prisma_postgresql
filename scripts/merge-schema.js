import fs from 'fs';
import path from 'path';

// Define paths for model files and the main schema
const modelsDirectory = path.join(process.cwd(), 'prisma/models');

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma'); // Main schema is in 'prisma' folder


const modelFiles = ['User.prisma', 'News.prisma',"Category.prisma","Media.prisma"]; // List your model files here

// Initialize the schema content
let schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
`;

// Append content from each model file
modelFiles.forEach((file) => {
    const filePath = path.join(modelsDirectory, file);
    const modelContent = fs.readFileSync(filePath, 'utf-8');
    schemaContent += `\n\n// ${file}\n${modelContent}`;
});

// Write the combined schema into the final schema.prisma file
fs.writeFileSync(schemaPath, schemaContent, 'utf-8');

console.log('Schema merged successfully!');