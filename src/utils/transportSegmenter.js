import { computeFare } from './fareCalculator';
import { findKnownRoute, getPassThroughBuses } from './routeKnowledgeBase';

function fareByFormula(formula, dist, discount = 'regular') {
  switch (formula) {
    case 'jeepney': return computeFare('Jeepney', dist, discount);
    case 'ejeep':   return computeFare('E-Jeep',  dist, discount);
    case 'bus':     return computeFare('Bus',      dist, discount);
    case 'tricycle':return computeFare('Tricycle', dist, discount);
    default:        return computeFare('Bus',      dist, discount);
  }
}

function midpoint(a, b) {
  const map = {
    calamba:'Calamba Crossing', batangas:'Batangas City Grand Terminal',
    lucena:'Lucena Grand Terminal', antipolo:'Antipolo Terminal',
    tagaytay:'Tagaytay Rotonda', 'sta rosa':'Sta. Rosa Junction',
    lipa:'SM Lipa Terminal', dasmarinas:'Dasmariñas Town Proper',
    bacoor:'Bacoor Terminal', 'san pablo':'San Pablo Terminal',
  };
  const n = s => s.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (n(a).includes(k) || n(b).includes(k)) return v;
  }
  return 'Town Center Terminal';
}

function makeOpt(label, segs, note = '') {
  return { label, note, segments: segs, totalFare: segs.reduce((s, x) => s + (x.fare || 0), 0) };
}

// FIX: segments use ACTUAL distances (not fractions of total, which caused equal km bug)
// Each segment gets its real distance; total sums to route distance
function heuristic(dist, oL, dL, discount = 'regular') {
  const opts = [];
  if (dist <= 3) {
    opts.push(makeOpt('Tricycle', [{ from:oL, to:dL, vehicle:'Tricycle', operator:'Local Tricycle', distance:parseFloat(dist.toFixed(2)), fare:computeFare('Tricycle', dist, discount), note:'Short hop' }]));
  } else if (dist <= 10) {
    opts.push(makeOpt('Jeepney (direct)', [{ from:oL, to:dL, vehicle:'Jeepney', operator:'Local Jeepney', distance:parseFloat(dist.toFixed(2)), fare:fareByFormula('jeepney', dist, discount), note:'Single jeepney ride' }]));
  } else if (dist <= 18) {
    const l1 = parseFloat((dist * 0.45).toFixed(2));
    const l2 = parseFloat((dist - l1).toFixed(2));  // FIX: remainder, not duplicate
    const mid = midpoint(oL, dL);
    opts.push(makeOpt('Jeepney + E-Jeep', [
      { from:oL, to:mid, vehicle:'Jeepney', operator:'Local Jeepney', distance:l1, fare:fareByFormula('jeepney', l1, discount), note:'Ride to transfer point' },
      { from:mid, to:dL, vehicle:'E-Jeep',  operator:'Local E-Jeep',  distance:l2, fare:fareByFormula('ejeep',   l2, discount), note:'Transfer to E-Jeep' },
    ]));
    opts.push(makeOpt('Jeepney (direct if available)', [
      { from:oL, to:dL, vehicle:'Jeepney', operator:'Local Jeepney', distance:parseFloat(dist.toFixed(2)), fare:fareByFormula('jeepney', dist, discount), note:'Check if a direct jeepney serves this route' },
    ]));
  } else if (dist <= 40) {
    const l1 = parseFloat((dist * 0.35).toFixed(2));
    const l2 = parseFloat((dist - l1).toFixed(2));
    const mid = midpoint(oL, dL);
    opts.push(makeOpt('Jeepney + Bus', [
      { from:oL, to:mid, vehicle:'Jeepney', operator:'Local Jeepney', distance:l1, fare:fareByFormula('jeepney', l1, discount) },
      { from:mid, to:dL, vehicle:'Bus',     operator:'Provincial Bus', distance:l2, fare:fareByFormula('bus',     l2, discount) },
    ]));
    opts.push(makeOpt('Direct Bus (if available)', [
      { from:oL, to:dL, vehicle:'Bus', operator:'Check local buses', distance:parseFloat(dist.toFixed(2)), fare:fareByFormula('bus', dist, discount), note:'Some buses serve this route directly — verify at terminal' },
    ]));
  } else if (dist <= 80) {
    const l1 = parseFloat((dist * 0.5).toFixed(2));
    const l2 = parseFloat((dist - l1).toFixed(2));
    const mid = midpoint(oL, dL);
    opts.push(makeOpt('Bus + Bus', [
      { from:oL, to:mid, vehicle:'Bus', operator:'Provincial Bus', distance:l1, fare:fareByFormula('bus', l1, discount) },
      { from:mid, to:dL, vehicle:'Bus', operator:'Provincial Bus', distance:l2, fare:fareByFormula('bus', l2, discount) },
    ]));
  } else {
    const l1 = parseFloat((dist * 0.45).toFixed(2));
    const l2 = parseFloat((dist * 0.45).toFixed(2));
    const l3 = parseFloat((dist - l1 - l2).toFixed(2));
    const mid = midpoint(oL, dL);
    opts.push(makeOpt('Long-haul Bus Route', [
      { from:oL,              to:mid,          vehicle:'Bus',      operator:'Provincial Bus',  distance:l1, fare:fareByFormula('bus',      l1, discount) },
      { from:mid,             to:dL+' Terminal',vehicle:'Bus',      operator:'Continuing Bus', distance:l2, fare:fareByFormula('bus',      l2, discount) },
      { from:dL+' Terminal',  to:dL,            vehicle:'Tricycle', operator:'Local Tricycle', distance:l3, fare:computeFare('Tricycle',   l3, discount), note:'Last-mile' },
    ]));
  }
  return opts;
}

export function buildRouteOptions(totalDistanceKm, originName, destName, discount = 'regular') {
  const dist = parseFloat(totalDistanceKm);
  const oL = originName.split(',')[0].trim();
  const dL = destName.split(',')[0].trim();

  if (dist <= 0.6) return [makeOpt('Walking', [{ from:oL, to:dL, vehicle:'Walk', operator:'', distance:dist, fare:0, note:'Short distance — walking is fastest' }])];
  if (dist <= 1.2) return [
    makeOpt('Walking (recommended)', [{ from:oL, to:dL, vehicle:'Walk', operator:'', distance:dist, fare:0, note:'Saves ₱30 over tricycle' }]),
    makeOpt('Tricycle', [{ from:oL, to:dL, vehicle:'Tricycle', operator:'Local Tricycle', distance:dist, fare:computeFare('Tricycle', dist, discount), note:'Short tricycle ride' }]),
  ];

  // 1. Known direct route
  const known = findKnownRoute(originName, destName);
  if (known) {
    return known.options.map(opt => {
      // FIX: build actual segment distances from fractions, ensuring they sum correctly
      const totalFrac = opt.segments.reduce((s, sg) => s + (sg.df || 1), 0);
      const segs = opt.segments.map((seg, idx) => {
        // Use real distance proportional to df, but last segment gets remainder
        const isLast = idx === opt.segments.length - 1;
        const prevTotal = opt.segments.slice(0, idx).reduce((s, sg) => s + parseFloat((dist * (sg.df || 1) / totalFrac).toFixed(2)), 0);
        const segDist = isLast
          ? parseFloat((dist - prevTotal).toFixed(2))
          : parseFloat((dist * (seg.df || 1) / totalFrac).toFixed(2));
        const from = seg.from.replace('{O}', oL).replace('{D}', dL);
        const to   = seg.to.replace('{O}', oL).replace('{D}', dL);
        const fare = seg.knownFare != null ? seg.knownFare : fareByFormula(seg.ff, segDist, discount);
        return { from, to, vehicle:seg.vehicle, operator:seg.operator, distance:Math.max(0.1, segDist), fare, note:seg.note||'' };
      });
      return makeOpt(opt.label, segs, opt.note||'');
    });
  }

  // 2. Pass-through bus detection
  const buses = getPassThroughBuses(originName, destName);
  if (buses.length) {
    const b = buses[0];
    return [
      makeOpt(`Hop-on: ${b.company} — ${b.route}`, [{
        from:oL, to:dL, vehicle:'Bus', operator:b.company,
        distance:parseFloat(dist.toFixed(2)),
        fare:fareByFormula('bus', dist, discount),
        note:`${b.company} buses on the ${b.route} route pass through here — hail at the roadside or board at the nearest terminal`,
      }]),
      ...heuristic(dist, oL, dL, discount),
    ];
  }

  // 3. Heuristic fallback
  return heuristic(dist, oL, dL, discount);
}

export function segmentRoute(totalDistanceKm, originName, destName, discount = 'regular') {
  return buildRouteOptions(totalDistanceKm, originName, destName, discount)[0]?.segments || [];
}