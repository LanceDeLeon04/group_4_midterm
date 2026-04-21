import { Bus, Zap, Bike, Car, Footprints, ArrowRight } from 'lucide-react';
import { getVehicleColor } from '../utils/fareCalculator';

const VIcon = ({ v, size=16 }) => {
  const p = { size, strokeWidth: 2.2 };
  if (v==='Walk')     return <Footprints {...p}/>;
  if (v==='Tricycle') return <Bike {...p}/>;
  if (v==='E-Jeep')   return <Zap {...p}/>;
  if (v==='Bus')      return <Bus {...p}/>;
  if (v==='TNVS')     return <Car {...p}/>;
  return <Bus {...p}/>;
};

export default function TransportSegmentCard({ segment, index, isLast }) {
  const color = getVehicleColor(segment.vehicle);
  return (
    <div style={{ display:'flex', gap:0, alignItems:'stretch', marginBottom:isLast?0:6 }}>
      {/* Timeline */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:36, flexShrink:0, paddingTop:2 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:`${color}14`, border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', color, flexShrink:0, transition:'transform 0.2s' }}>
          <VIcon v={segment.vehicle} size={14}/>
        </div>
        {!isLast && <div style={{ width:2, flex:1, minHeight:20, background:`linear-gradient(to bottom,${color}60,${color}10)`, margin:'4px 0' }}/>}
      </div>
      {/* Card */}
      <div style={{ flex:1, background:'#fff', border:'1px solid #f1f5f9', borderLeft:`3px solid ${color}`, borderRadius:'0 12px 12px 0', padding:'10px 14px', marginLeft:8, cursor:'default', transition:'box-shadow 0.2s, transform 0.15s' }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${color}20`;e.currentTarget.style.transform='translateX(3px)';}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateX(0)';}}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, flexWrap:'wrap' }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:`${color}14`, color, fontSize:10, fontWeight:700, letterSpacing:'0.05em', padding:'2px 7px', borderRadius:20 }}>
                <VIcon v={segment.vehicle} size={9}/>{segment.vehicle.toUpperCase()}
              </span>
              {segment.operator && <span style={{ fontSize:11, color:'#64748b', fontWeight:500 }}>{segment.operator}</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, color:'#1e293b', flexWrap:'wrap' }}>
              <span style={{ color:'#475569' }}>{segment.from}</span>
              <ArrowRight size={11} color="#94a3b8"/>
              <span>{segment.to}</span>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:3 }}>
              <span style={{ fontSize:11, color:'#94a3b8' }}>{parseFloat(segment.distance||0).toFixed(1)} km</span>
              {segment.note && <span style={{ fontSize:11, color:'#94a3b8' }}>{segment.note}</span>}
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            {segment.fare===0
              ? <div style={{ fontWeight:800, color:'#10b981', fontSize:14 }}>Free</div>
              : <>
                  <div style={{ fontWeight:800, color:'#0f172a', fontSize:16 }}>₱{segment.fare}</div>
                  <div style={{ fontSize:10, color:'#94a3b8' }}>est. fare</div>
                </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}