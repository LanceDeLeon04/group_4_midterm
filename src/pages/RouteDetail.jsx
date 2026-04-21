import { useParams, useNavigate } from 'react-router-dom';
import { useGetRouteByIdQuery } from '../services/apiSlice';
import RouteMap from '../components/RouteMap';
import TransportSegmentCard from '../components/TransportSegmentCard';
import { segmentRoute } from '../utils/transportSegmenter';
import { ArrowLeft } from 'lucide-react';

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: route, isLoading } = useGetRouteByIdQuery(id);

  if (isLoading) return (
    <div style={{ padding:60, textAlign:'center', color:'#64748b', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      Loading route details…
    </div>
  );
  if (!route) return (
    <div style={{ padding:60, textAlign:'center', color:'#ef4444', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      Route not found.
    </div>
  );

  const segments = segmentRoute(route.distance, route.origin, route.destination);
  const totalFare = segments.reduce((s,x)=>s+(x.fare||0), 0);
  const coords = route.geometry?.coordinates || [];
  const oCoords = coords.length ? [coords[0][1], coords[0][0]] : [14.2116, 121.1653];
  const dCoords = coords.length ? [coords[coords.length-1][1], coords[coords.length-1][0]] : [14.2116, 121.1653];

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 20px 60px', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <button onClick={()=>navigate(-1)} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', color:'#4f46e5', fontWeight:700, fontSize:13, marginBottom:20, fontFamily:'inherit', padding:0 }}>
        <ArrowLeft size={15}/> Back
      </button>
      <h1 style={{ fontSize:24, fontWeight:900, color:'#0f172a', margin:'0 0 4px', letterSpacing:'-0.03em' }}>
        {route.origin} <span style={{color:'#94a3b8', fontWeight:400}}>→</span> {route.destination}
      </h1>
      <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 24px', fontWeight:500 }}>Route ID: {route.id}</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[{l:'Distance',v:`${route.distance} km`},{l:'Duration',v:`${route.duration} min`},{l:'Total Fare',v:`₱${totalFare}`}].map(s=>(
          <div key={s.l} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', border:'1.5px solid #f0f2f7', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize:22, fontWeight:900, color:'#4f46e5', letterSpacing:'-0.02em' }}>{s.v}</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:3, fontWeight:600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:12 }}>Route Map</h2>
        <RouteMap originCoords={oCoords} destCoords={dCoords} geometry={route.geometry} originName={route.origin} destName={route.destination}/>
      </div>

      <div style={{ background:'#fff', borderRadius:18, padding:22, border:'1.5px solid #f0f2f7', boxShadow:'0 2px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:16 }}>Transport Segments</h2>
        {segments.map((seg,i)=><TransportSegmentCard key={i} segment={seg} index={i} isLast={i===segments.length-1}/>)}
        <div style={{ marginTop:16, paddingTop:14, borderTop:'2px dashed #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontWeight:700, fontSize:14, color:'#1e293b' }}>Total Estimated Fare</span>
          <span style={{ fontWeight:900, fontSize:22, color:'#4f46e5' }}>₱{totalFare}</span>
        </div>
      </div>
    </div>
  );
}