export interface ElectricityTariffProfile {
  name: string;
  rateTHBPerKWh: number;
  source: string;
  note: string;
}

export const THAI_LARGE_BUSINESS_AVERAGE_TARIFF_2026: ElectricityTariffProfile = {
  name: 'ERC large-business average tariff',
  rateTHBPerKWh: 4.30,
  source: 'Energy Literacy materials from the Energy Regulatory Commission (ERC)',
  note: 'Approximate average rate for large-business / industrial electricity users in Thailand.'
};