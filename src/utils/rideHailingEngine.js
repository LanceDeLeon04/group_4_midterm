import { isGrabAvailable, isAngkasAvailable, RUSH_HOURS } from './routeKnowledgeBase';

const GRAB_BASE    = 45;
const GRAB_PER_KM  = 15;
const GRAB_PER_MIN = 2;
const GRAB_MIN     = 70;
const ANGKAS_BASE   = 35;
const ANGKAS_PER_KM = 8;
const ANGKAS_MIN    = 50;

export function computeSurgeMultiplier(now = new Date()) {
  const hour = now.getHours();
  const day  = now.getDay();
  const isWeekend = day === 0 || day === 6;
  let multiplier = 1.0, label = 'No surge', level = 'NONE';
  for (const rh of RUSH_HOURS) {
    if (hour >= rh.start && hour < rh.end) {
      multiplier = rh.multiplier; label = rh.label;
      level = multiplier >= 1.5 ? 'HIGH_SURGE' : 'LOW_SURGE';
      break;
    }
  }
  if (isWeekend) {
    multiplier = Math.min(2.0, multiplier * 1.15);
    if (level === 'NONE') { level = 'LOW_SURGE'; label = 'Weekend demand'; }
  }
  multiplier = parseFloat(Math.min(2.0, Math.max(1.0, multiplier)).toFixed(2));
  return { multiplier, level, label, isWeekend };
}

export function computeGrabFare(distanceKm, durationMin, now = new Date()) {
  const dist = parseFloat(distanceKm);
  const dur  = parseFloat(durationMin) || (dist / 40) * 60;
  const distFee = dist * GRAB_PER_KM;
  const durFee  = dur  * GRAB_PER_MIN;
  const variable = distFee + durFee;
  const { multiplier, level, label } = computeSurgeMultiplier(now);
  const min = Math.max(GRAB_MIN, Math.round(GRAB_BASE + variable));
  const max = Math.max(GRAB_MIN, Math.round(GRAB_BASE + variable * multiplier));
  return {
    min, max, surgeMultiplier: multiplier, surgeLevel: level, surgeLabel: label,
    formula: `₱${GRAB_BASE} base + ₱${Math.round(distFee)} dist + ₱${Math.round(durFee)} dur × ${multiplier}x`,
  };
}

export function computeAngkasFare(distanceKm) {
  const dist = parseFloat(distanceKm);
  const fare = Math.max(ANGKAS_MIN, Math.round(ANGKAS_BASE + dist * ANGKAS_PER_KM));
  return { fare, formula: `₱${ANGKAS_BASE} base + ₱${ANGKAS_PER_KM}/km × ${dist.toFixed(1)} km` };
}

export function getTnvsOptions(distanceKm, durationMin, originName, destName, now = new Date()) {
  // FIX: check both endpoints — if EITHER is unavailable, mark unavailable
  const grabOriginOk = isGrabAvailable(originName);
  const grabDestOk   = isGrabAvailable(destName);
  const grabOk       = grabOriginOk && grabDestOk;

  const angkasOriginOk = isAngkasAvailable(originName);
  const angkasDestOk   = isAngkasAvailable(destName);
  const angkasOk       = angkasOriginOk && angkasDestOk;

  const options = [];

  if (grabOk) {
    const g = computeGrabFare(distanceKm, durationMin, now);
    options.push({
      service: 'Grab', icon: 'Car', available: true,
      fareMin: g.min, fareMax: g.max,
      surgeLevel: g.surgeLevel, surgeLabel: g.surgeLabel, formula: g.formula,
      note: g.surgeLevel !== 'NONE' ? `${g.surgeLabel} — expect higher fares` : 'Standard fare — no surge detected',
    });
  } else {
    const unavailAt = !grabOriginOk ? originName.split(',')[0] : destName.split(',')[0];
    options.push({ service: 'Grab', icon: 'Car', available: false, reason: `Grab is not available in ${unavailAt}. (Not covered: Quezon province, inner Batangas towns like Lemery, Calaca, Nasugbu)` });
  }

  if (angkasOk) {
    const a = computeAngkasFare(distanceKm);
    options.push({
      service: 'Angkas', icon: 'Bike', available: true,
      fareMin: a.fare, fareMax: a.fare,
      surgeLevel: 'NONE', formula: a.formula,
      note: 'Fixed fare motorcycle taxi — no surge pricing',
    });
  } else {
    const unavailAt = !angkasOriginOk ? originName.split(',')[0] : destName.split(',')[0];
    options.push({ service: 'Angkas', icon: 'Bike', available: false, reason: `Angkas is not available in ${unavailAt}. Angkas covers Metro Manila, Laguna, Cavite, and Rizal only.` });
  }

  return options;
}

export function getSurgeStatusColor(level) {
  if (level === 'HIGH_SURGE') return '#ef4444';
  if (level === 'LOW_SURGE')  return '#f59e0b';
  return '#10b981';
}