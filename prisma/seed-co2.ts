import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CO2 modules...');

  // Get first estufa to add module
  const estufa = await prisma.estufa.findFirst();
  
  if (!estufa) {
    console.log('❌ No estufa found. Please create an estufa first.');
    return;
  }

  console.log(`✅ Found estufa: ${estufa.nome}`);

  // Create CO2 Module
  const co2Module = await prisma.modulo.create({
    data: {
      estufa_id: estufa.id,
      tipo: 'CO2',
      nome: 'Controlador de CO2',
      ativo: true,
      configuracao: {
        nivelAlvo: 1000, // ppm
        modoAutomatico: true,
        horarioInicio: '06:00',
        horarioFim: '18:00',
      },
    },
  });

  console.log(`✅ Created CO2 module: ${co2Module.id}`);

  // Create CO2 Sensor
  const co2Sensor = await prisma.sensor.create({
    data: {
      modulo_id: co2Module.id,
      tipo: 'co2',
      unidade: 'ppm',
      valor_atual: 850,
      valor_min: 400,
      valor_max: 1500,
      ultima_leitura: new Date(),
    },
  });

  console.log(`✅ Created CO2 sensor: ${co2Sensor.id}`);

  // Create some historical data
  const now = new Date();
  const historicalData = [];
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Every hour
    const value = 800 + Math.random() * 400; // Random between 800-1200
    
    historicalData.push({
      sensor_id: co2Sensor.id,
      valor: value,
      timestamp,
    });
  }

  await prisma.historicoSensor.createMany({
    data: historicalData,
  });

  console.log(`✅ Created ${historicalData.length} historical readings`);

  // Create CO2 Valve Actuator
  const co2Valve = await prisma.atuador.create({
    data: {
      modulo_id: co2Module.id,
      tipo: 'valvula_co2',
      nome: 'Válvula Injetora CO2',
      estado: false,
      modo: 'automatico',
    },
  });

  console.log(`✅ Created CO2 valve actuator: ${co2Valve.id}`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
