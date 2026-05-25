import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { DEFAULT_SIMULATION_CONFIG, sanitizeSimulationConfig, SimulationConfig } from '@/lib/simulationConfig';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'simulation-config.json');

const writeConfigToDisk = async (config: SimulationConfig): Promise<void> => {
  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
};

const readConfigFromDisk = async (): Promise<SimulationConfig> => {
  try {
    const raw = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const config = sanitizeSimulationConfig(parsed);
    await writeConfigToDisk(config);
    return config;
  } catch {
    await writeConfigToDisk(DEFAULT_SIMULATION_CONFIG);
    return DEFAULT_SIMULATION_CONFIG;
  }
};

export async function GET() {
  const config = await readConfigFromDisk();
  return NextResponse.json({ config });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload =
      typeof body === 'object' && body !== null && 'config' in body
        ? (body as { config: unknown }).config
        : body;

    const config = sanitizeSimulationConfig(payload);
    await writeConfigToDisk(config);

    return NextResponse.json({ config });
  } catch {
    return NextResponse.json(
      { error: 'Invalid configuration payload' },
      { status: 400 }
    );
  }
}