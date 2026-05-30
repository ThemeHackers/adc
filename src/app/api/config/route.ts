import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { DEFAULT_SIMULATION_CONFIG, sanitizeSimulationConfig, SimulationConfig } from '@/lib/simulationConfig';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'simulation-config.json');


let inMemoryConfig: SimulationConfig | null = null;

const writeConfigToDisk = async (config: SimulationConfig): Promise<void> => {
  await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
};

const readConfigFromDisk = async (): Promise<SimulationConfig> => {
  try {
    const raw = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const config = sanitizeSimulationConfig(parsed);
    try {
      await writeConfigToDisk(config);
    } catch {

    }
    return config;
  } catch {
    if (inMemoryConfig) {
      return inMemoryConfig;
    }
    try {
      await writeConfigToDisk(DEFAULT_SIMULATION_CONFIG);
    } catch {

    }
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


    inMemoryConfig = config;


    try {
      await writeConfigToDisk(config);
    } catch (err) {
      console.warn('Unable to write configuration to disk (expected on Vercel/read-only filesystems):', err);
    }

    return NextResponse.json({ config });
  } catch (err) {
    console.error('Failed to parse or process config payload:', err);
    return NextResponse.json(
      { error: 'Invalid configuration payload' },
      { status: 400 }
    );
  }
}