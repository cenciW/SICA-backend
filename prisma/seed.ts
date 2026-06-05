import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt();
  const password_hash = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sica.com' },
    update: {},
    create: {
      email: 'admin@sica.com',
      username: 'admin',
      password_hash,
      full_name: 'Administrador',
      role: 'ADMIN',
    },
  });

  const product = await prisma.product.upsert({
    where: { link_code: '100001' },
    update: {},
    create: {
      user_id: admin.id,
      name: 'Sistema Hidropônico SICA',
      description: 'Unidade hidropônica com monitoramento de pH e PPM (partículas por milhão)',
      link_code: '100001',
    },
  });

  // Verifica se já existe uma instância do admin para este produto
  const existing = await prisma.userProduct.findFirst({
    where: { product_id: product.id, user_id: admin.id },
  });

  if (!existing) {
    await prisma.userProduct.create({
      data: {
        product_id: product.id,
        user_id: admin.id,
        role: 'OWNER',
        name: 'Bancada Principal',
        client_id: 'SICA01',
        ph_min: 5.5,
        ph_max: 6.5,
        ppm_min: 700,
        ppm_max: 1400,
      },
    });
  }

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
