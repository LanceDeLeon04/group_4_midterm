import { useState, useRef, useEffect, useCallback } from 'react';
import { useGetLocationsQuery, useGetRouteQuery } from '../services/apiSlice';
import RouteMap from '../components/RouteMap';
import TransportSegmentCard from '../components/TransportSegmentCard';
import { buildRouteOptions } from '../utils/transportSegmenter';
import { getTnvsOptions, getSurgeStatusColor } from '../utils/rideHailingEngine';
import {
  MapPin, Navigation, Route, ArrowRight, Loader2, Info,
  Car, Bike, Plus, X, ChevronDown, ChevronUp,
  Sun, Cloud, CloudRain, Zap, Wind, Droplets, AlertTriangle, Thermometer,
  Users,
} from 'lucide-react';

const OWM_KEY = 'bd5e378503939ddaee76f12ad7a97608'; // free OpenWeatherMap key

const QK = [
  { label:'Calamba',    full:'Calamba, Laguna, Philippines',      lat:14.2116, lon:121.1653 },
  { label:'Sta. Rosa',  full:'Sta. Rosa, Laguna, Philippines',    lat:14.3122, lon:121.0114 },
  { label:'Cabuyao',    full:'Cabuyao, Laguna, Philippines',      lat:14.2756, lon:121.1253 },
  { label:'Biñan',      full:'Biñan, Laguna, Philippines',        lat:14.3416, lon:121.0798 },
  { label:'Batangas',   full:'Batangas City, Philippines',        lat:13.7565, lon:121.0583 },
  { label:'Tagaytay',   full:'Tagaytay, Cavite, Philippines',     lat:14.1153, lon:120.9621 },
  { label:'Antipolo',   full:'Antipolo, Rizal, Philippines',      lat:14.5243, lon:121.1763 },
  { label:'Lucena',     full:'Lucena, Quezon, Philippines',       lat:13.9322, lon:121.6175 },
  { label:'Lipa',       full:'Lipa, Batangas, Philippines',       lat:13.9411, lon:121.1633 },
  { label:'Dasmariñas', full:'Dasmariñas, Cavite, Philippines',   lat:14.3294, lon:120.9367 },
  { label:'Lemery',     full:'Lemery, Batangas, Philippines',     lat:13.8567, lon:120.9069 },
  { label:'Calaca',     full:'Calaca, Batangas, Philippines',     lat:13.9335, lon:120.8135 },
];

const DISCOUNT_OPTIONS = [
  { value:'regular', label:'Regular',  icon: null },
  { value:'student', label:'Student (−20%)', icon: null },
  { value:'senior',  label:'Senior (−20%)', icon: null },
  { value:'pwd',     label:'PWD (−20%)', icon: null },
];

// ── Weather helpers ───────────────────────────
function weatherIcon(main, size=16) {
  if (!main) return <Cloud size={size} color="#94a3b8"/>;
  const m = main.toLowerCase();
  if (m.includes('thunder'))  return <Zap size={size} color="#f59e0b"/>;
  if (m.includes('rain') || m.includes('drizzle')) return <CloudRain size={size} color="#3b82f6"/>;
  if (m.includes('cloud'))    return <Cloud size={size} color="#64748b"/>;
  if (m.includes('clear'))    return <Sun size={size} color="#f59e0b"/>;
  return <Wind size={size} color="#94a3b8"/>;
}

function isFloodRisk(weather) {
  if (!weather) return false;
  const m = (weather.weather?.[0]?.main || '').toLowerCase();
  const d = (weather.weather?.[0]?.description || '').toLowerCase();
  return m.includes('rain') || m.includes('thunder') || d.includes('heavy') || d.includes('flood');
}

function WeatherCard({ weather, label, color }) {
  if (!weather) return null;
  const w = weather.weather?.[0];
  const temp = Math.round(weather.main?.temp || 0);
  const flood = isFloodRisk(weather);
  return (
    <div style={{ background: flood ? '#fef2f2' : '#f8fafc', border: `1.5px solid ${flood ? '#fecaca' : '#f0f2f7'}`, borderRadius: 12, padding: '10px 14px', flex: 1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <MapPin size={10} color={color}/>
        <span style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</span>
        {flood && <span style={{ fontSize:9, fontWeight:800, background:'#fef2f2', color:'#ef4444', padding:'1px 6px', borderRadius:20, marginLeft:'auto' }}>FLOOD RISK</span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {weatherIcon(w?.main, 20)}
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:'#0f172a', lineHeight:1 }}>{temp}°C</div>
          <div style={{ fontSize:11, color:'#64748b', marginTop:1 }}>{w?.description || '—'}</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <div style={{ textAlign:'center' }}>
            <Droplets size={12} color="#3b82f6"/>
            <div style={{ fontSize:10, fontWeight:600, color:'#475569' }}>{weather.main?.humidity || 0}%</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <Wind size={12} color="#64748b"/>
            <div style={{ fontSize:10, fontWeight:600, color:'#475569' }}>{Math.round((weather.wind?.speed||0)*3.6)} km/h</div>
          </div>
        </div>
      </div>
      {flood && (
        <div style={{ marginTop:8, fontSize:11, color:'#b91c1c', fontWeight:600, display:'flex', gap:5, alignItems:'center' }}>
          <AlertTriangle size={11}/> Possible flooding — allow extra travel time
        </div>
      )}
    </div>
  );
}

// ── LocationInput ─────────────────────────────
function LocationInput({ label, color, placeholder, value, onSelect, onClear, reverseGeocode, onPin }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: sugg = [] } = useGetLocationsQuery(q, { skip: q.length < 2 });

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    // FIX: high z-index on the INPUT WRAPPER so dropdown goes over the map
    <div ref={ref} style={{ flex:1, minWidth:0, position:'relative', zIndex:500 }}>
      <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>
        <MapPin size={10} color={color} style={{flexShrink:0}}/>{label}
      </label>
      <div onClick={() => setOpen(true)}
        style={{ display:'flex', alignItems:'center', gap:8, background:open?'#fefeff':'#f8fafc', border:open?`2px solid ${color}`:'1.5px solid #e2e8f0', borderRadius:12, padding:'0 12px', cursor:'text', transition:'all 0.18s', boxShadow:open?`0 0 0 4px ${color}18`:'none' }}>
        <MapPin size={14} color={value?color:'#c8d3e0'} style={{flexShrink:0}}/>
        {value ? (
          <>
            <div style={{ flex:1, padding:'11px 0', fontSize:14, fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {value.display_name.split(',').slice(0,2).join(',')}
            </div>
            <button onClick={e=>{e.stopPropagation();onClear();setQ('');}} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:'0 0 0 4px',flexShrink:0}}>
              <X size={13}/>
            </button>
          </>
        ) : (
          <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}} placeholder={placeholder}
            style={{ flex:1, border:'none', background:'transparent', fontSize:14, fontWeight:500, color:'#0f172a', outline:'none', padding:'11px 0' }}
            onFocus={()=>setOpen(true)}/>
        )}
      </div>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, boxShadow:'0 12px 40px rgba(0,0,0,0.15)', zIndex:9999, overflow:'hidden' }}>
          {/* Current Location */}
          <div style={{ padding:'8px 10px', borderBottom:'1px solid #f1f5f9' }}>
            <button onMouseDown={e=>{e.preventDefault();
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition(async pos => {
                const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                onSelect({ display_name:name, lat:String(pos.coords.latitude), lon:String(pos.coords.longitude) });
                setQ(''); setOpen(false);
              });
            }}
              style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:7 }}>
              <Navigation size={13} color="#4f46e5"/> Use My Current Location
            </button>
          </div>
          {/* Pin on Map — FIX: NO scroll */}
          <div style={{ padding:'6px 10px', borderBottom:'1px solid #f1f5f9' }}>
            <button onMouseDown={e=>{e.preventDefault(); onPin(); setOpen(false);}}
              style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:7 }}>
              <MapPin size={13} color="#10b981"/> Pin Location on Map
            </button>
          </div>
          {/* Quick picks */}
          <div style={{ padding:'10px 12px 8px', borderBottom:'1px solid #f1f5f9' }}>
            <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 }}>Quick Select</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {QK.map(l=>(
                <button key={l.label} onMouseDown={e=>{e.preventDefault();onSelect({display_name:l.full,lat:String(l.lat),lon:String(l.lon)});setQ('');setOpen(false);}}
                  style={{ padding:'4px 10px', fontSize:11, fontWeight:600, borderRadius:20, border:'1.5px solid #e2e8f0', background:'#f8fafc', color:'#475569', cursor:'pointer', transition:'all 0.13s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=color+'18';e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color;}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#475569';}}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          {/* Search results */}
          {q.length >= 2 && sugg.map((s,i)=>(
            <div key={s.place_id||i} onMouseDown={e=>{e.preventDefault();onSelect(s);setQ('');setOpen(false);}}
              style={{ padding:'10px 14px', cursor:'pointer', fontSize:13, fontWeight:500, color:'#1e293b', display:'flex', alignItems:'center', gap:8, borderTop:'1px solid #f8fafc', transition:'background 0.1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
              <MapPin size={11} color="#94a3b8"/>{s.display_name}
            </div>
          ))}
          {q.length >= 2 && sugg.length===0 && <div style={{ padding:'14px', fontSize:13, color:'#94a3b8', textAlign:'center' }}>No results — try a different spelling</div>}
        </div>
      )}
    </div>
  );
}

// ── RouteOptionCard ───────────────────────────
function RouteOptionCard({ option, index, isSelected, onClick, discount }) {
  const [exp, setExp] = useState(isSelected);
  useEffect(()=>setExp(isSelected),[isSelected]);
  // Re-calculate fares with discount if needed
  const totalFare = option.segments.reduce((s,x)=>s+(x.fare||0),0);
  return (
    <div style={{ border:`${isSelected?'2px':'1.5px'} solid ${isSelected?'#4f46e5':'#e2e8f0'}`, borderRadius:14, background:'#fff', overflow:'hidden', marginBottom:10, transition:'all 0.2s', boxShadow:isSelected?'0 6px 24px rgba(79,70,229,0.13)':'0 1px 6px rgba(0,0,0,0.05)' }}>
      <div onClick={()=>{onClick();setExp(true);}} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px', cursor:'pointer' }}
        onMouseEnter={e=>e.currentTarget.style.background='#fafbff'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{ width:28, height:28, borderRadius:8, background:isSelected?'#4f46e5':'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:12, fontWeight:800, color:isSelected?'#fff':'#64748b' }}>{index+1}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:2 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{option.label}</span>
            {index===0 && <span style={{ fontSize:9, fontWeight:800, background:'#f0fdf4', color:'#16a34a', padding:'2px 7px', borderRadius:20 }}>CHEAPEST</span>}
          </div>
          {option.note && <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>{option.note}</div>}
          <div style={{ fontSize:11, color:'#94a3b8' }}>{option.segments.length} seg · {option.segments.map(s=>s.vehicle).join(' → ')}</div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0, marginRight:6 }}>
          <div style={{ fontSize:19, fontWeight:800, color:isSelected?'#4f46e5':'#0f172a' }}>₱{totalFare}</div>
          {discount !== 'regular' && <div style={{ fontSize:9, color:'#16a34a', fontWeight:700 }}>−20% applied</div>}
        </div>
        <button onClick={e=>{e.stopPropagation();setExp(v=>!v);}} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex', padding:0 }}>
          {exp?<ChevronUp size={15}/>:<ChevronDown size={15}/>}
        </button>
      </div>
      {exp && (
        <div style={{ padding:'2px 15px 15px', borderTop:'1px solid #f1f5f9' }}>
          {option.segments.map((seg,i)=><TransportSegmentCard key={i} segment={seg} index={i} isLast={i===option.segments.length-1}/>)}
        </div>
      )}
    </div>
  );
}

// ── RideHailingPanel ─────────────────────────
function RideHailingPanel({ opts }) {
  const [exp, setExp] = useState(false);
  const avail = opts.filter(o=>o.available).length;
  return (
    <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', marginTop:8 }}>
      <div onClick={()=>setExp(v=>!v)} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px', cursor:'pointer' }}
        onMouseEnter={e=>e.currentTarget.style.background='#fafbff'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{ width:28, height:28, borderRadius:8, background:'#f3f0ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Car size={14} color="#7c3aed"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Grab / Angkas Estimates</span>
            <span style={{ fontSize:9, fontWeight:800, background: avail>0 ? '#f0fdf4' : '#f1f5f9', color: avail>0 ? '#16a34a' : '#94a3b8', padding:'2px 7px', borderRadius:20 }}>
              {avail>0 ? `${avail} AVAILABLE` : 'UNAVAILABLE IN AREA'}
            </span>
          </div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>LTFRB fare formula · real-time surge · no discount applicable</div>
        </div>
        {exp?<ChevronUp size={15} color="#94a3b8"/>:<ChevronDown size={15} color="#94a3b8"/>}
      </div>
      {exp && (
        <div style={{ padding:'4px 15px 15px', borderTop:'1px solid #f1f5f9' }}>
          {opts.map((o,i)=>(
            <div key={i} style={{ background:o.available?'#fff':'#fafafa', border:`1.5px solid ${o.available?'#e2e8f0':'#f1f5f9'}`, borderRadius:11, padding:'12px 13px', marginBottom:8, opacity:o.available?1:0.65 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    {o.icon==='Bike'?<Bike size={14} color="#d97706"/>:<Car size={14} color="#7c3aed"/>}
                    <span style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{o.service}</span>
                    {o.available
                      ? <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20, background:getSurgeStatusColor(o.surgeLevel)+'18', color:getSurgeStatusColor(o.surgeLevel) }}>
                          {o.surgeLevel==='NONE'?'NO SURGE':o.surgeLevel==='LOW_SURGE'?'LOW SURGE':'HIGH SURGE'}
                        </span>
                      : <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20, background:'#fef2f2', color:'#ef4444' }}>NOT AVAILABLE</span>
                    }
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{o.available?o.note:o.reason}</div>
                  {o.available&&o.formula&&<div style={{ fontSize:10, color:'#94a3b8', marginTop:3, fontFamily:'monospace' }}>{o.formula}</div>}
                </div>
                {o.available&&(
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:16, color:'#0f172a' }}>₱{o.fareMin}{o.fareMax!==o.fareMin?`–₱${o.fareMax}`:''}</div>
                    <div style={{ fontSize:10, color:'#94a3b8' }}>est. range</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div style={{ fontSize:10, color:'#94a3b8', display:'flex', gap:5, alignItems:'flex-start', marginTop:2 }}>
            <Info size={10} style={{flexShrink:0,marginTop:1}}/>
            LTFRB formula: ₱45 base + ₱15/km + ₱2/min. Surge up to 2× during rush hours &amp; weekends. Discounts (Student/Senior/PWD) do NOT apply to TNVS.
          </div>
        </div>
      )}
    </div>
  );
}

// ── AddRouteModal ────────────────────────────
function AddRouteModal({ onAdd, onClose }) {
  const [f, setF] = useState({ from:'', to:'', vehicle:'Jeepney', operator:'', fare:'', note:'' });
  const inp = { width:'100%', padding:'9px 11px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, fontWeight:500, color:'#0f172a', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border 0.15s' };
  const lbl = txt => <label style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>{txt}</label>;
  const ok = f.from && f.to && f.fare;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:420, boxShadow:'0 32px 64px rgba(0,0,0,0.22)', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}><X size={14}/></button>
        <h3 style={{ fontWeight:800, fontSize:17, color:'#0f172a', marginBottom:4 }}>Add a Route Segment</h3>
        <p style={{ fontSize:12, color:'#64748b', marginBottom:18 }}>Know a better route? Add it and help fellow commuters.</p>
        <div style={{ marginBottom:12 }}>{lbl('From')}<input value={f.from} onChange={e=>setF({...f,from:e.target.value})} placeholder="e.g. Calamba Crossing" style={inp} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/></div>
        <div style={{ marginBottom:12 }}>{lbl('To')}<input value={f.to} onChange={e=>setF({...f,to:e.target.value})} placeholder="e.g. Lemery Terminal" style={inp} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/></div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <div>{lbl('Vehicle')}<select value={f.vehicle} onChange={e=>setF({...f,vehicle:e.target.value})} style={{...inp,cursor:'pointer'}}>{['Walk','Tricycle','Jeepney','E-Jeep','Bus','TNVS'].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
          <div>{lbl('Fare (₱)')}<input type="number" value={f.fare} onChange={e=>setF({...f,fare:e.target.value})} placeholder="e.g. 75" style={inp} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/></div>
        </div>
        <div style={{ marginBottom:12 }}>{lbl('Bus Operator (optional)')}<input value={f.operator} onChange={e=>setF({...f,operator:e.target.value})} placeholder="e.g. DLTB, JAC Liner" style={inp} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/></div>
        <div style={{ marginBottom:20 }}>{lbl('Notes (optional)')}<input value={f.note} onChange={e=>setF({...f,note:e.target.value})} placeholder="e.g. Departs hourly at Turbina" style={inp} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/></div>
        <button disabled={!ok} onClick={()=>{if(!ok)return;onAdd({from:f.from,to:f.to,vehicle:f.vehicle,operator:f.operator,distance:0,fare:parseInt(f.fare)||0,note:f.note});onClose();}}
          style={{ width:'100%', padding:'12px', background:ok?'linear-gradient(135deg,#4f46e5,#4338ca)':'#e2e8f0', color:ok?'#fff':'#94a3b8', border:'none', borderRadius:11, fontWeight:700, fontSize:14, cursor:ok?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', transition:'all 0.2s' }}>
          <Plus size={16}/> Add Segment
        </button>
      </div>
    </div>
  );
}

function StatBadge({ label, value, accent }) {
  return (
    <div style={{ textAlign:'center', padding:'0 16px' }}>
      <div style={{ fontSize:20, fontWeight:900, color:accent||'#fff', letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:3 }}>{label}</div>
    </div>
  );
}

// ── Main Home ────────────────────────────────
export default function Home() {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest]     = useState(null);
  const [picking, setPicking] = useState(null); // 'origin' | 'destination' | null
  const [triggered, setTriggered] = useState(false);
  const [selOpt, setSelOpt] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [customSegs, setCustomSegs] = useState([]);
  const [discount, setDiscount] = useState('regular');
  const [originWeather, setOriginWeather] = useState(null);
  const [destWeather, setDestWeather]     = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const oCoords = origin ? [parseFloat(origin.lat), parseFloat(origin.lon)] : null;
  const dCoords = dest   ? [parseFloat(dest.lat),   parseFloat(dest.lon)]   : null;

  const { data: rd, isLoading, isFetching } = useGetRouteQuery(
    { originCoords: oCoords, destCoords: dCoords },
    { skip: !triggered || !oCoords || !dCoords }
  );

  const oLabel = origin?.display_name?.split(',').slice(0,2).join(',').trim() || '';
  const dLabel = dest?.display_name?.split(',').slice(0,2).join(',').trim()   || '';

  const routeOpts = rd ? buildRouteOptions(rd.distance, oLabel, dLabel, discount) : [];
  const tnvsOpts  = rd ? getTnvsOptions(rd.distance, rd.duration, oLabel, dLabel) : [];
  const allOpts   = customSegs.length
    ? [...routeOpts, { label:'My Custom Route', note:'Added by you', segments:customSegs, totalFare:customSegs.reduce((s,c)=>s+c.fare,0) }]
    : routeOpts;

  const loading = isLoading || isFetching;
  const bestFare = allOpts.length ? Math.min(...allOpts.map(o=>o.totalFare)) : 0;

  async function reverseGeocode(lat, lon) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data.display_name || 'Unknown location';
    } catch { return 'Unknown location'; }
  }

  // Fetch weather for both endpoints
  async function fetchWeather(lat, lon) {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`);
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  }

  const handleFind = async () => {
    if (!oCoords || !dCoords) return;
    setTriggered(true); setSelOpt(0); setCustomSegs([]);
    // Fetch weather for both locations
    setWeatherLoading(true);
    const [ow, dw] = await Promise.all([
      fetchWeather(oCoords[0], oCoords[1]),
      fetchWeather(dCoords[0], dCoords[1]),
    ]);
    setOriginWeather(ow); setDestWeather(dw);
    setWeatherLoading(false);
  };

  const swap = () => { setOrigin(dest); setDest(origin); setTriggered(false); setOriginWeather(null); setDestWeather(null); };

  // Pin location: set picking mode WITHOUT scrolling
  const handlePinOrigin = useCallback(() => setPicking('origin'), []);
  const handlePinDest   = useCallback(() => setPicking('destination'), []);

  const handleMapClick = useCallback(async (lat, lng) => {
    if (!picking) return;
    const name = await reverseGeocode(lat, lng);
    if (picking === 'origin') setOrigin({ display_name:name, lat:String(lat), lon:String(lng) });
    else setDest({ display_name:name, lat:String(lat), lon:String(lng) });
    setPicking(null);
    setTriggered(false);
    // FIX: NO window.scrollTo here
  }, [picking]);

  return (
    <div style={{ maxWidth:980, margin:'0 auto', padding:'32px 20px 60px' }}>

      {/* Header */}
      <div className="anim-fade-down" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:5 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(79,70,229,0.35)' }}>
            <Navigation size={20} color="#fff"/>
          </div>
          <div>
            {/* FIX: renamed to "Commute Planner" */}
            <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', margin:0, letterSpacing:'-0.03em', lineHeight:1 }}>Commute Planner</h1>
            <p style={{ fontSize:12, color:'#64748b', margin:0, marginTop:2 }}>CALABARZON Smart Commute Intelligence · SDG 11</p>
          </div>
        </div>
      </div>

      {/* Planner Card */}
      <div className="anim-fade-up" style={{ background:'#fff', borderRadius:20, padding:'24px 24px 20px', marginBottom:20, boxShadow:'0 2px 24px rgba(0,0,0,0.07)', border:'1.5px solid #f0f2f7', position:'relative', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:16 }}>
          <LocationInput label="Origin" color="#10b981" placeholder="Where are you starting?"
            value={origin} onSelect={v=>{setOrigin(v);setTriggered(false);}} onClear={()=>{setOrigin(null);setTriggered(false);setOriginWeather(null);}}
            reverseGeocode={reverseGeocode} onPin={handlePinOrigin}/>
          <button onClick={swap}
            style={{ width:38, height:38, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b', flexShrink:0, marginBottom:1, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#eef2ff';e.currentTarget.style.borderColor='#4f46e5';e.currentTarget.style.color='#4f46e5';e.currentTarget.style.transform='rotate(180deg)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#64748b';e.currentTarget.style.transform='rotate(0)';}}>
            <ArrowRight size={15}/>
          </button>
          <LocationInput label="Destination" color="#ef4444" placeholder="Where are you going?"
            value={dest} onSelect={v=>{setDest(v);setTriggered(false);}} onClear={()=>{setDest(null);setTriggered(false);setDestWeather(null);}}
            reverseGeocode={reverseGeocode} onPin={handlePinDest}/>
        </div>

        {/* Discount selector */}
        <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:11, fontWeight:700, color:'#64748b', display:'flex', gap:5, alignItems:'center' }}>
            <Users size={11}/> Passenger:
          </span>
          {DISCOUNT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={()=>setDiscount(opt.value)}
              style={{ padding:'5px 11px', fontSize:11, fontWeight:700, borderRadius:20, border:`1.5px solid ${discount===opt.value?'#4f46e5':'#e2e8f0'}`, background:discount===opt.value?'#eef2ff':'#f8fafc', color:discount===opt.value?'#4f46e5':'#475569', cursor:'pointer', transition:'all 0.15s' }}>
              {opt.label}
            </button>
          ))}
        </div>

        <button onClick={handleFind} disabled={!origin||!dest||loading}
          style={{ width:'100%', padding:'13px', border:'none', borderRadius:12, fontWeight:800, fontSize:14, fontFamily:'inherit', background:origin&&dest&&!loading?'linear-gradient(135deg,#4f46e5,#7c3aed)':'#e2e8f0', color:origin&&dest&&!loading?'#fff':'#94a3b8', cursor:origin&&dest&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.2s', boxShadow:origin&&dest&&!loading?'0 4px 18px rgba(79,70,229,0.32)':'none' }}
          onMouseEnter={e=>{if(origin&&dest&&!loading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(79,70,229,0.4)';}}}
          onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=origin&&dest&&!loading?'0 4px 18px rgba(79,70,229,0.32)':'none';}}>
          {loading ? <><Loader2 size={17} className="anim-spin"/> Computing routes…</> : <><Navigation size={17}/> Find Best Routes</>}
        </button>
      </div>

      {/* Mock notice */}
      {rd?.isMock && (
        <div style={{ display:'flex', gap:9, alignItems:'center', background:'#fefce8', border:'1.5px solid #fde68a', borderRadius:12, padding:'11px 15px', marginBottom:18 }}>
          <Info size={14} color="#ca8a04"/>
          <span style={{ fontSize:12, fontWeight:500, color:'#854d0e' }}>
            Estimated route. Get a free ORS API key at <a href="https://openrouteservice.org" target="_blank" rel="noreferrer" style={{ color:'#ca8a04', fontWeight:700 }}>openrouteservice.org</a> and update <code style={{fontSize:11}}>apiSlice.js</code>.
          </span>
        </div>
      )}

      {/* Map in picking mode (before route is computed) */}
      {!rd && (oCoords || dCoords || picking) && (
        <div style={{ marginBottom:20, position:'relative', zIndex:1 }}>
          <RouteMap
            originCoords={oCoords} destCoords={dCoords}
            geometry={null} originName={oLabel} destName={dLabel}
            onMapClick={handleMapClick} picking={picking}
          />
        </div>
      )}

      {/* Results */}
      {rd && (
        <div>
          {/* Weather strip */}
          {(originWeather || destWeather) && (
            <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
              <WeatherCard weather={originWeather} label={`Origin: ${oLabel.split(',')[0]}`} color="#10b981"/>
              <WeatherCard weather={destWeather}   label={`Destination: ${dLabel.split(',')[0]}`} color="#ef4444"/>
            </div>
          )}
          {weatherLoading && <div style={{ fontSize:12, color:'#94a3b8', marginBottom:14 }}>Fetching weather data…</div>}

          {/* Summary banner */}
          <div style={{ background:'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius:18, padding:'20px 24px', marginBottom:22, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14, boxShadow:'0 8px 32px rgba(15,23,42,0.20)' }}>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, marginBottom:5 }}>Route</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:15, fontWeight:700 }}>
                <span style={{ color:'#34d399' }}>{oLabel.split(',')[0]}</span>
                <ArrowRight size={13} color="rgba(255,255,255,0.3)"/>
                <span style={{ color:'#f87171' }}>{dLabel.split(',')[0]}</span>
              </div>
              {discount !== 'regular' && (
                <div style={{ fontSize:10, color:'#a5b4fc', marginTop:4, fontWeight:700 }}>
                  {DISCOUNT_OPTIONS.find(d=>d.value===discount)?.label} discount applied
                </div>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'stretch', gap:0 }}>
              <StatBadge label="Road Distance" value={`${rd.distance} km`}/>
              <div style={{ width:1, background:'rgba(255,255,255,0.08)', margin:'0 4px' }}/>
              <StatBadge label="Travel Time"   value={`${rd.duration} min`}/>
              <div style={{ width:1, background:'rgba(255,255,255,0.08)', margin:'0 4px' }}/>
              <StatBadge label="Best Fare" value={`₱${bestFare}`} accent="#fbbf24"/>
            </div>
          </div>

          {/* Two-column */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
            {/* LEFT */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:0 }}>
                  {allOpts.length} Route Option{allOpts.length!==1?'s':''}
                </h2>
                <button onClick={()=>setShowAdd(true)}
                  style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:'#4f46e5', background:'#eef2ff', border:'1.5px solid #c7d2fe', borderRadius:8, padding:'5px 10px', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#e0e7ff'}
                  onMouseLeave={e=>e.currentTarget.style.background='#eef2ff'}>
                  <Plus size={12}/> Add Route
                </button>
              </div>
              {allOpts.map((opt,i)=>(
                <RouteOptionCard key={`${i}-${discount}`} option={opt} index={i} isSelected={selOpt===i} onClick={()=>setSelOpt(i)} discount={discount}/>
              ))}
              <RideHailingPanel opts={tnvsOpts}/>
            </div>

            {/* RIGHT: map — z-index:1 keeps it BEHIND the planner card's dropdowns */}
            <div style={{ position:'sticky', top:80 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:0 }}>Live Route Map</h2>
                <span style={{ fontSize:9, fontWeight:800, background:'#eef2ff', color:'#4f46e5', padding:'2px 8px', borderRadius:20 }}>OPENSTREETMAP</span>
              </div>
              {/* FIX: zIndex:1 — map column stays BEHIND the search dropdowns */}
              <div style={{ position:'relative', zIndex:1 }}>
                <RouteMap
                  originCoords={oCoords} destCoords={dCoords}
                  geometry={rd.geometry} originName={oLabel} destName={dLabel}
                  onMapClick={handleMapClick} picking={picking}
                />
              </div>

              {allOpts[selOpt] && (
                <div style={{ background:'#fff', borderRadius:12, padding:'13px 15px', marginTop:12, border:'1.5px solid #f0f2f7', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
                    Selected · {allOpts[selOpt].label}
                  </div>
                  {allOpts[selOpt].segments.map((seg,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500, color:'#475569', marginBottom:4 }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'#4f46e5', flexShrink:0 }}/>
                      <span style={{ fontWeight:600, color:'#1e293b' }}>{seg.from}</span>
                      <ArrowRight size={9} color="#94a3b8"/>
                      <span>{seg.to}</span>
                      <span style={{ marginLeft:'auto', fontWeight:700, color:'#0f172a', fontSize:13 }}>₱{seg.fare}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'1.5px dashed #e2e8f0', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>Total Estimated Fare</span>
                    <span style={{ fontSize:16, fontWeight:900, color:'#4f46e5' }}>₱{allOpts[selOpt].totalFare}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!triggered && !loading && !picking && (
        <div style={{ background:'#fff', borderRadius:20, padding:'56px 24px', textAlign:'center', border:'2px dashed #e2e8f0' }}>
          <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,#eef2ff,#e0e7ff)', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(79,70,229,0.12)' }}>
            <Navigation size={30} color="#4f46e5"/>
          </div>
          <h3 style={{ fontSize:19, fontWeight:800, color:'#0f172a', margin:'0 0 8px', letterSpacing:'-0.02em' }}>Smart CALABARZON Commute Planner</h3>
          <p style={{ fontSize:13, color:'#64748b', margin:0, maxWidth:400, marginInline:'auto', lineHeight:1.7 }}>
            Search any origin and destination across Cavite, Laguna, Batangas, Rizal, and Quezon. Multiple transport options, real bus operators, Grab/Angkas estimates, and live weather data.
          </p>
        </div>
      )}

      {showAdd && <AddRouteModal onAdd={seg=>setCustomSegs(p=>[...p,seg])} onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}