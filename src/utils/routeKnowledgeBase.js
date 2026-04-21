export function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

// FIX: use normalized keys (no special chars) so isGrabAvailable() matches correctly
export const GRAB_COVERAGE = {
  calamba: true, 'sta rosa': true, cabuyao: true, binan: true, 'san pedro': true,
  calauan: true, 'los banos': true, bay: true, pagsanjan: true,
  bacoor: true, imus: true, dasmarinas: true, tagaytay: true,
  'trece martires': true, 'general trias': true, silang: true,
  tanza: true, kawit: true, naic: true, carmona: true,
  antipolo: true, cainta: true, taytay: true, angono: true, binangonan: true,
  'batangas city': true, lipa: true, 'sto tomas': true, tanauan: true,
  // NOT available
  lemery: false, calaca: false, nasugbu: false, lobo: false,
  'san jose': false, mabini: false,
  lucena: false, tayabas: false, sariaya: false, candelaria: false,
  tiaong: false, 'san pablo': false, 'sta cruz': false,
};

export const ANGKAS_COVERAGE = {
  calamba: true, 'sta rosa': true, cabuyao: true, binan: true,
  'san pedro': true, bacoor: true, imus: true, dasmarinas: true,
  tagaytay: true, carmona: true,
  antipolo: true, cainta: true, taytay: true, angono: true,
  // NOT available
  lipa: false, 'batangas city': false, lemery: false, calaca: false,
  lucena: false, 'san pablo': false,
};

export const RUSH_HOURS = [
  { start: 6,  end: 9,  label: 'Morning rush',  multiplier: 1.65 },
  { start: 11, end: 13, label: 'Midday surge',   multiplier: 1.25 },
  { start: 17, end: 20, label: 'Evening rush',   multiplier: 1.80 },
];

export const KNOWN_ROUTES = [
  // WITHIN LAGUNA
  {
    matches: [['cabuyao','calamba'],['calamba','cabuyao']],
    options: [{ label:'Direct Jeepney', note:'Jeepneys run continuously along the national road.', segments:[{from:'{O}',to:'{D}',vehicle:'Jeepney',operator:'Local Jeepney',df:1.0,ff:'jeepney'}] }],
  },
  {
    matches: [['sta rosa','calamba'],['calamba','sta rosa'],['balibago','calamba'],['calamba','balibago']],
    options: [{ label:'Direct Jeepney — no terminal stop needed', note:'Jeepneys pass SM Calamba → Turbina → Balibago directly.', segments:[{from:'{O}',to:'{D}',vehicle:'Jeepney',operator:'Local Jeepney',df:1.0,ff:'jeepney'}] }],
  },
  {
    matches: [['binan','calamba'],['binan','sta rosa'],['calamba','binan'],['sta rosa','binan']],
    options: [{ label:'Bus or Jeepney (JAC / JAM pass through)', note:'JAC and JAM buses on Manila routes pass through Biñan–Calamba.', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'JAC Liner / JAM Liner (flag down)',df:1.0,ff:'bus'}] }],
  },
  {
    matches: [['calamba','los banos'],['los banos','calamba']],
    options: [{ label:'Direct Jeepney (UPLB route)', segments:[{from:'{O}',to:'{D}',vehicle:'Jeepney',operator:'UPLB-Calamba Jeepney',df:1.0,ff:'jeepney'}] }],
  },
  {
    matches: [['calamba','san pablo'],['san pablo','calamba']],
    options: [{ label:'Bus (JAC / JAM Liner)', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'JAC Liner / JAM Liner',df:1.0,ff:'bus'}] }],
  },
  {
    matches: [['calamba','sta cruz'],['sta cruz','calamba']],
    options: [{ label:'Bus (JAC / HM Transport)', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'JAC Liner / HM Transport',df:1.0,ff:'bus'}] }],
  },
  // CALAMBA ↔ BATANGAS
  {
    matches: [['calamba','batangas city'],['batangas city','calamba']],
    options: [{ label:'Direct Bus (DLTB / JAM / Japs Transport)', note:'Buses run via SLEX and Sto. Tomas exit. ~1 hour travel time.', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'DLTB / JAM Liner / Japs Transport',df:1.0,ff:'bus',knownFare:100}] }],
  },
  {
    matches: [['calamba','lipa'],['lipa','calamba']],
    options: [{ label:'Direct Bus (DLTB / JAM / ALPS)', note:'Board at Turbina terminal. Buses go via Sto. Tomas.', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'DLTB / JAM Liner / ALPS',df:1.0,ff:'bus',knownFare:80}] }],
  },
  {
    matches: [['calamba','lemery'],['lemery','calamba']],
    options: [{ label:'Direct Bus (DLTB / JAM Liner)', note:'DLTB and JAM have Calamba–Lemery direct trips from Turbina.', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'DLTB / JAM Liner',df:1.0,ff:'bus',knownFare:90}] }],
  },
  {
    matches: [['calamba','tagaytay'],['tagaytay','calamba']],
    options: [{ label:'Direct Bus (DLTB / ALPS)', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'DLTB / ALPS The Bus',df:1.0,ff:'bus',knownFare:75}] }],
  },
  {
    matches: [['calamba','nasugbu'],['nasugbu','calamba']],
    options: [{ label:'Bus via Tagaytay (DLTB)', note:'DLTB runs Calamba–Nasugbu via Tagaytay. ~2.5 hrs.', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'DLTB Co.',df:1.0,ff:'bus'}] }],
  },
  // CALAMBA ↔ CALACA (two options)
  {
    matches: [['calamba','calaca'],['calaca','calamba']],
    options: [
      { label:'Option A — Bus to Lemery then Jeepney to Calaca (CHEAPEST)', note:'Board DLTB/JAM at Turbina. Alight at Lemery terminal. Jeepney to Calaca.',
        segments:[
          {from:'{O}',to:'Lemery Terminal',vehicle:'Bus',operator:'DLTB / JAM Liner',df:0.72,ff:'bus',knownFare:90},
          {from:'Lemery Terminal',to:'{D}',vehicle:'Jeepney',operator:'Lemery–Calaca Jeepney',df:0.28,ff:'jeepney'},
        ] },
      { label:'Option B — Bus to Batangas City then Bus to Calaca', note:'Ride any Batangas-bound bus. From Batangas Grand Terminal, take Calaca-bound bus via ACTEX.',
        segments:[
          {from:'{O}',to:'Batangas City Grand Terminal',vehicle:'Bus',operator:'DLTB / JAM / Japs',df:0.65,ff:'bus',knownFare:100},
          {from:'Batangas City Grand Terminal',to:'{D}',vehicle:'Bus',operator:'Calaca-bound Local Bus',df:0.35,ff:'bus'},
        ] },
    ],
  },
  // CALAMBA ↔ QUEZON
  {
    matches: [['calamba','lucena'],['lucena','calamba']],
    options: [{ label:'Direct Bus (JAC Liner / Superlines)', note:'Regular Calamba–Lucena trips. Board at Turbina or Calamba Crossing.', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'JAC Liner / Superlines',df:1.0,ff:'bus',knownFare:140}] }],
  },
  {
    matches: [['batangas city','lucena'],['lucena','batangas city']],
    options: [{ label:'Bus (Ceres / DLTB)', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'Ceres Bus / DLTB',df:1.0,ff:'bus',knownFare:150}] }],
  },
  // BATANGAS CITY ↔ LEMERY
  {
    matches: [['batangas city','lemery'],['lemery','batangas city']],
    options: [
      { label:'Jeepney via Batangas Flyover (2 rides)', note:'Jeepney to Batangas Flyover, then another jeepney to Lemery.',
        segments:[
          {from:'{O}',to:'Batangas Flyover',vehicle:'Jeepney',operator:'Local Jeepney',df:0.3,ff:'jeepney'},
          {from:'Batangas Flyover',to:'{D}',vehicle:'Jeepney',operator:'Lemery Jeepney',df:0.7,ff:'jeepney'},
        ] },
      { label:'Nasugbu-bound Bus (pass-through)', note:'Some Nasugbu-bound buses pass through Lemery — flag down at the highway.',
        segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'Nasugbu-bound Bus',df:1.0,ff:'bus'}] },
    ],
  },
  // CAVITE
  {
    matches: [['tagaytay','dasmarinas'],['dasmarinas','tagaytay']],
    options: [{ label:'Bus (ALPS / DLTB)', segments:[{from:'{O}',to:'{D}',vehicle:'Bus',operator:'ALPS The Bus / DLTB',df:1.0,ff:'bus'}] }],
  },
  {
    matches: [['bacoor','dasmarinas'],['dasmarinas','bacoor']],
    options: [{ label:'Direct Jeepney', segments:[{from:'{O}',to:'{D}',vehicle:'Jeepney',operator:'Cavite Jeepney',df:1.0,ff:'jeepney'}] }],
  },
  // RIZAL
  {
    matches: [['antipolo','cainta'],['cainta','antipolo']],
    options: [{ label:'Direct Jeepney', segments:[{from:'{O}',to:'{D}',vehicle:'Jeepney',operator:'Antipolo–Cainta Jeepney',df:1.0,ff:'jeepney'}] }],
  },
  {
    matches: [['antipolo','angono'],['angono','antipolo']],
    options: [{ label:'E-Jeep / Jeepney', segments:[{from:'{O}',to:'{D}',vehicle:'E-Jeep',operator:'Rizal E-Jeep',df:1.0,ff:'ejeep'}] }],
  },
  // LIPA ↔ LUCENA
  {
    matches: [['lipa','lucena'],['lucena','lipa']],
    options: [{ label:'Bus via Batangas City',
      segments:[
        {from:'{O}',to:'Batangas City Grand Terminal',vehicle:'Bus',operator:'Local Bus',df:0.45,ff:'bus'},
        {from:'Batangas City Grand Terminal',to:'{D}',vehicle:'Bus',operator:'Ceres / DLTB',df:0.55,ff:'bus'},
      ] }],
  },
];

export const BUS_PASS_THROUGH = [
  { company:'DLTB',       route:'Manila–Batangas City', passes:['calamba','turbina','sto tomas','tanauan','lipa'] },
  { company:'DLTB',       route:'Manila–Lemery',        passes:['calamba','turbina','tagaytay junction','lemery'] },
  { company:'DLTB',       route:'Manila–Lucena',        passes:['calamba','san pablo','candelaria','sariaya','lucena'] },
  { company:'DLTB',       route:'Manila–Tagaytay',      passes:['calamba','sta rosa','tagaytay'] },
  { company:'JAC Liner',  route:'Manila–Lucena',        passes:['binan','calamba','san pablo','candelaria','lucena'] },
  { company:'JAC Liner',  route:'Manila–Sta Cruz',      passes:['binan','calamba','pagsanjan','sta cruz'] },
  { company:'JAM Liner',  route:'Manila–Batangas City', passes:['cabuyao','calamba','sto tomas','lipa','batangas city'] },
  { company:'JAM Liner',  route:'Manila–Lemery',        passes:['cabuyao','calamba','tagaytay junction','lemery'] },
  { company:'ALPS',       route:'Manila–San Juan Batangas', passes:['lipa','batangas city','san juan batangas'] },
  { company:'Ceres Bus',  route:'Manila–Batangas Pier', passes:['calamba','lipa','batangas city','batangas pier'] },
  { company:'Superlines', route:'Manila–Lucena',        passes:['calamba','san pablo','tiaong','candelaria','lucena'] },
];

export function isGrabAvailable(name) {
  const n = normalize(name);
  // Check for explicit false first (more specific)
  for (const [k, v] of Object.entries(GRAB_COVERAGE)) {
    if (v === false && n.includes(k)) return false;
  }
  // Then check true
  for (const [k, v] of Object.entries(GRAB_COVERAGE)) {
    if (v === true && n.includes(k)) return true;
  }
  return false;
}

export function isAngkasAvailable(name) {
  const n = normalize(name);
  for (const [k, v] of Object.entries(ANGKAS_COVERAGE)) {
    if (v === false && n.includes(k)) return false;
  }
  for (const [k, v] of Object.entries(ANGKAS_COVERAGE)) {
    if (v === true && n.includes(k)) return true;
  }
  return false;
}

export function findKnownRoute(originName, destName) {
  const o = normalize(originName);
  const d = normalize(destName);
  for (const entry of KNOWN_ROUTES) {
    for (const [pk, pk2] of entry.matches) {
      if ((o.includes(pk) && d.includes(pk2)) || (o.includes(pk2) && d.includes(pk))) return entry;
    }
  }
  return null;
}

export function getPassThroughBuses(originName, destName) {
  const o = normalize(originName);
  const d = normalize(destName);
  return BUS_PASS_THROUGH.filter(r =>
    r.passes.some(p => o.includes(p)) && r.passes.some(p => d.includes(p))
  );
}