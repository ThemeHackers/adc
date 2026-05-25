export type LegacyTamperFields = {
  pendulumHeight?: number;
  pendulumVelocity?: number;
  pendulumMass?: number;
};

export type ModernTamperFields = {
  tamperHeight?: number;
  tamperVelocity?: number;
  tamperMass?: number;
};

export type CompatibleTamperFields = LegacyTamperFields & ModernTamperFields;

export function normalizeTamperFields<T extends CompatibleTamperFields>(input: T): T & {
  tamperHeight?: number;
  tamperVelocity?: number;
  tamperMass?: number;
} {
  return {
    ...input,
    tamperHeight: input.tamperHeight ?? input.pendulumHeight,
    tamperVelocity: input.tamperVelocity ?? input.pendulumVelocity,
    tamperMass: input.tamperMass ?? input.pendulumMass,
  };
}
