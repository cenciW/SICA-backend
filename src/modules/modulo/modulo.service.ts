import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModuloService {
  constructor(private prisma: PrismaService) {}

  async create(createModuloDto: CreateModuloDto) {
    const { estufaId, tipo, ...data } = createModuloDto;
    
    // Create module
    const modulo = await this.prisma.modulo.create({
      data: {
        ...data,
        tipo,
        estufa: {
          connect: { id: estufaId },
        },
      },
    });

    // Auto-create sensors and actuators based on module type
    await this.createDefaultDevices(modulo.id, tipo);

    // Return module with sensors and actuators
    return this.prisma.modulo.findUnique({
      where: { id: modulo.id },
      include: {
        sensores: true,
        atuadores: true,
      },
    });
  }

  /**
   * Create default sensors and actuators for each module type
   */
  private async createDefaultDevices(moduloId: string, tipo: string) {
    switch (tipo) {
      case 'CO2':
        await this.createCO2Devices(moduloId);
        break;
      case 'IRRIGACAO':
        await this.createIrrigacaoDevices(moduloId);
        break;
      case 'ILUMINACAO':
        await this.createIluminacaoDevices(moduloId);
        break;
      case 'CLIMA':
        await this.createClimaDevices(moduloId);
        break;
      case 'NUTRICAO':
        await this.createNutricaoDevices(moduloId);
        break;
    }
  }

  private async createCO2Devices(moduloId: string) {
    // CO2 Sensor
    await this.prisma.sensor.create({
      data: {
        modulo_id: moduloId,
        tipo: 'co2',
        unidade: 'ppm',
        valor_min: 400,
        valor_max: 1500,
        valor_atual: 800,
      },
    });

    // CO2 Valve
    await this.prisma.atuador.create({
      data: {
        modulo_id: moduloId,
        tipo: 'valvula_co2',
        nome: 'Válvula Injetora CO2',
        estado: false,
        modo: 'automatico',
      },
    });
  }

  private async createIrrigacaoDevices(moduloId: string) {
    // Sensors: pH, EC, Water Level, Temperature
    await this.prisma.sensor.createMany({
      data: [
        {
          modulo_id: moduloId,
          tipo: 'ph',
          unidade: 'pH',
          valor_min: 5.5,
          valor_max: 6.5,
          valor_atual: 6.0,
        },
        {
          modulo_id: moduloId,
          tipo: 'ec',
          unidade: 'mS/cm',
          valor_min: 1.2,
          valor_max: 2.0,
          valor_atual: 1.6,
        },
        {
          modulo_id: moduloId,
          tipo: 'nivel',
          unidade: 'cm',
          valor_min: 10,
          valor_max: 100,
          valor_atual: 80,
        },
        {
          modulo_id: moduloId,
          tipo: 'temperatura',
          unidade: '°C',
          valor_min: 18,
          valor_max: 25,
          valor_atual: 22,
        },
      ],
    });

    // Actuators: Main Pump + 4 Valves
    await this.prisma.atuador.createMany({
      data: [
        {
          modulo_id: moduloId,
          tipo: 'bomba',
          nome: 'Bomba Principal',
          estado: false,
          modo: 'automatico',
        },
        {
          modulo_id: moduloId,
          tipo: 'valvula',
          nome: 'Válvula Setor 1',
          estado: false,
          modo: 'manual',
        },
        {
          modulo_id: moduloId,
          tipo: 'valvula',
          nome: 'Válvula Setor 2',
          estado: false,
          modo: 'manual',
        },
        {
          modulo_id: moduloId,
          tipo: 'valvula',
          nome: 'Válvula Setor 3',
          estado: false,
          modo: 'manual',
        },
        {
          modulo_id: moduloId,
          tipo: 'valvula',
          nome: 'Válvula Setor 4',
          estado: false,
          modo: 'manual',
        },
      ],
    });
  }

  private async createIluminacaoDevices(moduloId: string) {
    // Light Sensor
    await this.prisma.sensor.create({
      data: {
        modulo_id: moduloId,
        tipo: 'luz',
        unidade: 'lux',
        valor_min: 20000,
        valor_max: 50000,
        valor_atual: 35000,
      },
    });

    // LED Controller
    await this.prisma.atuador.create({
      data: {
        modulo_id: moduloId,
        tipo: 'led',
        nome: 'Painel LED Full Spectrum',
        estado: false,
        modo: 'automatico',
      },
    });
  }

  private async createClimaDevices(moduloId: string) {
    // Climate Sensors: Temperature, Humidity, Pressure
    await this.prisma.sensor.createMany({
      data: [
        {
          modulo_id: moduloId,
          tipo: 'temperatura',
          unidade: '°C',
          valor_min: 18,
          valor_max: 28,
          valor_atual: 24,
        },
        {
          modulo_id: moduloId,
          tipo: 'umidade',
          unidade: '%',
          valor_min: 50,
          valor_max: 70,
          valor_atual: 60,
        },
        {
          modulo_id: moduloId,
          tipo: 'pressao',
          unidade: 'hPa',
          valor_min: 960,
          valor_max: 1040,
          valor_atual: 1013,
        },
      ],
    });

    // Climate Actuators: Exhaust Fan, Circulation Fan
    await this.prisma.atuador.createMany({
      data: [
        {
          modulo_id: moduloId,
          tipo: 'exaustor',
          nome: 'Exaustor',
          estado: false,
          modo: 'automatico',
        },
        {
          modulo_id: moduloId,
          tipo: 'ventilador',
          nome: 'Ventilador de Circulação',
          estado: false,
          modo: 'automatico',
        },
      ],
    });
  }

  private async createNutricaoDevices(moduloId: string) {
    // Nutrition Sensors: pH, EC, Temperature
    await this.prisma.sensor.createMany({
      data: [
        {
          modulo_id: moduloId,
          tipo: 'ph',
          unidade: 'pH',
          valor_min: 5.5,
          valor_max: 6.5,
          valor_atual: 6.0,
        },
        {
          modulo_id: moduloId,
          tipo: 'ec',
          unidade: 'mS/cm',
          valor_min: 1.0,
          valor_max: 2.5,
          valor_atual: 1.8,
        },
        {
          modulo_id: moduloId,
          tipo: 'temperatura',
          unidade: '°C',
          valor_min: 18,
          valor_max: 24,
          valor_atual: 21,
        },
      ],
    });

    // Nutrition Pumps: A, B, pH Up/Down
    await this.prisma.atuador.createMany({
      data: [
        {
          modulo_id: moduloId,
          tipo: 'bomba_a',
          nome: 'Dosadora Nutriente A',
          estado: false,
          modo: 'automatico',
        },
        {
          modulo_id: moduloId,
          tipo: 'bomba_b',
          nome: 'Dosadora Nutriente B',
          estado: false,
          modo: 'automatico',
        },
        {
          modulo_id: moduloId,
          tipo: 'bomba_ph',
          nome: 'Dosadora pH',
          estado: false,
          modo: 'automatico',
        },
      ],
    });
  }

  async findAllByEstufa(estufaId: string) {
    return this.prisma.modulo.findMany({
      where: { estufa_id: estufaId },
      include: {
        sensores: true,
        atuadores: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(id: string) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id },
      include: {
        sensores: {
          include: {
            historico: {
              take: 50,
              orderBy: { timestamp: 'desc' },
            },
          },
        },
        atuadores: true,
      },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo com ID ${id} não encontrado`);
    }

    return modulo;
  }

  async update(id: string, updateModuloDto: UpdateModuloDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.modulo.update({
      where: { id },
      data: updateModuloDto,
      include: {
        sensores: true,
        atuadores: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.modulo.delete({
      where: { id },
    });
  }

  // Toggle atuador state
  async toggleAtuador(moduloId: string, atuadorId: string, estado: boolean) {
    const modulo = await this.findOne(moduloId);
    
    const atuador = modulo.atuadores.find((a) => a.id === atuadorId);
    if (!atuador) {
      throw new NotFoundException(`Atuador com ID ${atuadorId} não encontrado no módulo`);
    }

    return this.prisma.atuador.update({
      where: { id: atuadorId },
      data: {
        estado,
        ultima_acao: new Date(),
      },
    });
  }
}
