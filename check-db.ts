import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if codigo_vinculo exists by trying to select it
  const estufas = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'estufa' 
    ORDER BY ordinal_position;
  `;
  
  console.log('Columns in estufa table:', JSON.stringify(estufas, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
