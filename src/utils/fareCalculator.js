export const VEHICLE_RATES = {
  Walk:     { base: 0,  perKm: 0,    multiplier: 1.0 },
  Tricycle: { base: 30, perKm: 0,    multiplier: 1.0 },
  Jeepney:  { base: 13, perKm: 1.80, multiplier: 1.0 },
  'E-Jeep': { base: 13, perKm: 1.80, multiplier: 1.1 },
  Bus:      { base: 15, perKm: 2.20, multiplier: 1.3 },
  TNVS:     { base: 40, perKm: 3.50, multiplier: 2.5 },
};

// Discounts per RA 9994 (Senior/PWD) & student discount
export const DISCOUNT_RATES = {
  regular: 0,
  student: 0.20,  // 20% student discount on PUVs
  senior:  0.20,  // 20% senior citizen discount (RA 9994)
  pwd:     0.20,  // 20% PWD discount (RA 10754)
};

// TNVS / ride-hailing NOT eligible for discounts
const NO_DISCOUNT_VEHICLES = ['TNVS', 'Walk'];

export function computeFare(vehicleType, distanceKm, discountType = 'regular') {
  const rate = VEHICLE_RATES[vehicleType];
  if (!rate) return 0;
  if (vehicleType === 'Walk') return 0;
  if (vehicleType === 'Tricycle') {
    const base = 30;
    const discount = NO_DISCOUNT_VEHICLES.includes(vehicleType) ? 0 : (DISCOUNT_RATES[discountType] || 0);
    return Math.round(base * (1 - discount));
  }
  const raw = Math.round((rate.base + distanceKm * rate.perKm) * rate.multiplier);
  const discount = NO_DISCOUNT_VEHICLES.includes(vehicleType) ? 0 : (DISCOUNT_RATES[discountType] || 0);
  return Math.round(raw * (1 - discount));
}

export function getVehicleColor(vehicleType) {
  const colors = {
    Walk:     '#10b981',
    Tricycle: '#8b5cf6',
    Jeepney:  '#f59e0b',
    'E-Jeep': '#06b6d4',
    Bus:      '#3b82f6',
    TNVS:     '#ef4444',
  };
  return colors[vehicleType] || '#64748b';
}