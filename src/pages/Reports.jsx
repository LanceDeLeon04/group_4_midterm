import { useState } from 'react';
import { useGetReportsQuery, useCreateReportMutation, useGetStrikesQuery } from '../services/apiSlice';
import { AlertTriangle, Plus, X, CheckCircle, FileWarning, Radio, ChevronRight, MapPin, Calendar, Tag } from 'lucide-react';
import Pagination from '../components/Pagination';

const CATS = ['overcharging','rude driver','unsafe driving','route disruption','strike'];
const PER  = 5;

const ST = {
  active:   { bg:'#fff1f2', border:'#fecdd3', badge:'#ef4444', text:'#9f1239' },
  resolved: { bg:'#f0fdf4', border:'#bbf7d0', badge:'#16a34a', text:'#14532d' },
  open:     { bg:'#fefce8', border:'#fde68a', badge:'#ca8a04', text:'#854d0e' },
};

const CAT_COLOR = {
  overcharging:    '#f59e0b',
  'rude driver':   '#ef4444',
  'unsafe driving':'#dc2626',
  'route disruption':'#3b82f6',
  strike:          '#8b5cf6',
};

export default function Reports() {
  const { data: reports = [], refetch } = useGetReportsQuery();
  const { data: strikes = [] } = useGetStrikesQuery();
  const [create, { isLoading: submitting }] = useCreateReportMutation();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [modal, setModal]   = useState(false);
  const [viewReport, setViewReport] = useState(null); // report detail modal
  const [form, setForm]     = useState({ category:'overcharging', description:'', location:'' });
  const [ok, setOk]         = useState(false);

  const filtered = reports.filter(r => {
    const matchSearch = r.category.toLowerCase().includes(search.toLowerCase())
      || r.location.toLowerCase().includes(search.toLowerCase())
      || r.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || r.category === filterCat;
    return matchSearch && matchCat;
  });
  const totalPgs  = Math.max(1, Math.ceil(filtered.length / PER));
  const paginated = filtered.slice((page-1)*PER, page*PER);

  const handleSubmit = async () => {
    if (!form.description.trim()||!form.location.trim()) return;
    await create(form); await refetch();
    setOk(true); setModal(false); setForm({ category:'overcharging', description:'', location:'' });
    setTimeout(()=>setOk(false), 3500);
  };

  const inp = { width:'100%', padding:'9px 11px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, fontWeight:500, color:'#0f172a', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border 0.15s', marginTop:4, marginBottom:12 };
  const lbl = t => <label style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t}</label>;

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 20px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:5 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#ef4444,#dc2626)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(239,68,68,0.32)' }}>
            <FileWarning size={20} color="#fff"/>
          </div>
          <div>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', margin:0, letterSpacing:'-0.03em' }}>Transport Reports</h1>
            <p style={{ fontSize:12, color:'#64748b', margin:0, marginTop:2 }}>Community-sourced reports and active transport strikes across CALABARZON</p>
          </div>
        </div>
      </div>

      {ok && (
        <div style={{ display:'flex', gap:10, alignItems:'center', background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:12, padding:'13px 16px', marginBottom:18 }}>
          <CheckCircle size={16} color="#16a34a"/>
          <span style={{ fontWeight:700, color:'#14532d', fontSize:13 }}>Report submitted! The community thanks you.</span>
        </div>
      )}

      {/* Strikes */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Radio size={15} color="#ef4444"/>
          <h2 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Transport Strikes</h2>
          <span style={{ fontSize:9, fontWeight:800, background:'#fff1f2', color:'#ef4444', padding:'2px 8px', borderRadius:20 }}>
            {strikes.filter(s=>s.status==='active').length} ACTIVE
          </span>
        </div>
        {strikes.map(s=>{
          const st = ST[s.status]||ST.open;
          return (
            <div key={s.id} style={{ background:st.bg, border:`1.5px solid ${st.border}`, borderRadius:14, padding:'15px 17px', marginBottom:10, transition:'box-shadow 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.07)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:7 }}>
                <span style={{ fontWeight:700, fontSize:14, color:st.text }}>{s.reason}</span>
                <span style={{ background:st.badge, color:'#fff', fontSize:9, fontWeight:800, padding:'3px 10px', borderRadius:20, flexShrink:0, textTransform:'uppercase' }}>{s.status}</span>
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:12, color:'#64748b' }}>
                <span><strong>Provinces:</strong> {s.affectedProvinces.join(', ')}</span>
                <span><strong>Routes:</strong> {s.affectedRoutes.join(' · ')}</span>
                <span style={{ color:'#94a3b8' }}>{s.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports list */}
      <div style={{ background:'#fff', borderRadius:20, padding:24, border:'1.5px solid #f0f2f7', boxShadow:'0 2px 20px rgba(0,0,0,0.05)' }}>
        {/* Controls */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
          <h2 style={{ fontSize:15, fontWeight:800, color:'#0f172a', margin:0 }}>Community Reports</h2>
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <input placeholder="Search reports…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
              style={{ padding:'7px 11px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:12, fontWeight:500, outline:'none', width:180, color:'#0f172a', fontFamily:'inherit', transition:'border 0.15s' }}
              onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            <button onClick={()=>setModal(true)}
              style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', border:'none', borderRadius:9, padding:'9px 15px', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(239,68,68,0.28)', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 5px 16px rgba(239,68,68,0.38)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 3px 12px rgba(239,68,68,0.28)';}}>
              <Plus size={14}/> Submit Report
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {['all',...CATS].map(c=>(
            <button key={c} onClick={()=>{setFilterCat(c);setPage(1);}}
              style={{ padding:'4px 10px', fontSize:11, fontWeight:700, borderRadius:20, border:`1.5px solid ${filterCat===c?(CAT_COLOR[c]||'#4f46e5'):'#e2e8f0'}`, background:filterCat===c?((CAT_COLOR[c]||'#4f46e5')+'15'):'#f8fafc', color:filterCat===c?(CAT_COLOR[c]||'#4f46e5'):'#475569', cursor:'pointer', transition:'all 0.13s', textTransform:'capitalize' }}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>

        {paginated.length===0 && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#94a3b8' }}>
            <FileWarning size={32} style={{ marginBottom:10, opacity:0.35 }}/>
            <div style={{ fontSize:13, fontWeight:500 }}>No reports found</div>
          </div>
        )}

        {/* FIX: Clicking a report opens the detail modal */}
        {paginated.map(r=>{
          const st = ST[r.status]||ST.open;
          const catColor = CAT_COLOR[r.category] || '#64748b';
          return (
            <div key={r.id}
              onClick={() => setViewReport(r)}
              style={{ background:'#fafafa', borderRadius:12, padding:'13px 15px', marginBottom:9, border:'1.5px solid #f1f5f9', transition:'all 0.2s', cursor:'pointer' }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 4px 18px rgba(0,0,0,0.07)';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.background='#fafafa';}}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, alignItems:'center' }}>
                <span style={{ fontSize:10, fontWeight:800, color:catColor, textTransform:'uppercase', letterSpacing:'0.07em', background:catColor+'12', padding:'2px 8px', borderRadius:20 }}>{r.category}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ background:st.badge, color:'#fff', fontSize:9, fontWeight:800, padding:'2px 9px', borderRadius:20, textTransform:'uppercase' }}>{r.status}</span>
                  <ChevronRight size={13} color="#94a3b8"/>
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:5 }}>{r.description}</div>
              <div style={{ display:'flex', gap:12, fontSize:11, color:'#94a3b8', fontWeight:500 }}>
                <span style={{ display:'flex', gap:4, alignItems:'center' }}><MapPin size={10}/>{r.location}</span>
                <span style={{ display:'flex', gap:4, alignItems:'center' }}><Calendar size={10}/>{r.date}</span>
              </div>
            </div>
          );
        })}

        <Pagination currentPage={page} totalPages={totalPgs} onPageChange={setPage}/>
      </div>

      {/* ── Report Detail Modal ── */}
      {viewReport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}
          onClick={e=>{if(e.target===e.currentTarget)setViewReport(null);}}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:480, boxShadow:'0 32px 64px rgba(0,0,0,0.22)', position:'relative' }}>
            <button onClick={()=>setViewReport(null)} style={{ position:'absolute', top:16, right:16, background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
              <X size={14}/>
            </button>

            {/* Status badge */}
            {(() => {
              const st = ST[viewReport.status]||ST.open;
              const cc = CAT_COLOR[viewReport.category]||'#64748b';
              return (
                <>
                  <div style={{ display:'flex', gap:8, marginBottom:14, alignItems:'center' }}>
                    <span style={{ fontSize:10, fontWeight:800, background:cc+'15', color:cc, padding:'3px 10px', borderRadius:20, textTransform:'uppercase', letterSpacing:'0.06em' }}>{viewReport.category}</span>
                    <span style={{ background:st.badge, color:'#fff', fontSize:9, fontWeight:800, padding:'3px 10px', borderRadius:20, textTransform:'uppercase' }}>{viewReport.status}</span>
                  </div>
                  <h3 style={{ fontWeight:800, fontSize:18, color:'#0f172a', marginBottom:14, lineHeight:1.3 }}>{viewReport.description}</h3>
                  <div style={{ background:'#f8fafc', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Location</div>
                        <div style={{ display:'flex', gap:5, alignItems:'center', fontSize:13, fontWeight:600, color:'#1e293b' }}><MapPin size={13} color="#4f46e5"/>{viewReport.location}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Date Reported</div>
                        <div style={{ display:'flex', gap:5, alignItems:'center', fontSize:13, fontWeight:600, color:'#1e293b' }}><Calendar size={13} color="#4f46e5"/>{viewReport.date}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Report ID</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>#{viewReport.id}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Status</div>
                        <div style={{ fontSize:13, fontWeight:700, color:st.badge, textTransform:'capitalize' }}>{viewReport.status}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'#64748b', lineHeight:1.7 }}>
                    This report has been submitted by a community member and is under review by CalabarzONE moderators. If you witnessed this incident, you can submit a corroborating report.
                  </div>
                  <button onClick={()=>setViewReport(null)}
                    style={{ marginTop:18, width:'100%', padding:'11px', background:'#f1f5f9', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', color:'#475569', transition:'all 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#e2e8f0'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f1f5f9'}>
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Submit Modal ── */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}
          onClick={e=>{if(e.target===e.currentTarget)setModal(false);}}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:430, boxShadow:'0 32px 64px rgba(0,0,0,0.22)', position:'relative' }}>
            <button onClick={()=>setModal(false)} style={{ position:'absolute', top:16, right:16, background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
              <X size={14}/>
            </button>
            <h3 style={{ fontWeight:800, fontSize:17, color:'#0f172a', marginBottom:4 }}>Submit a Report</h3>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:20 }}>Help the community by reporting transport issues in CALABARZON.</p>
            {lbl('Category')}
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            {lbl('Location')}
            <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. Calamba, Laguna" style={inp}
              onFocus={e=>e.target.style.borderColor='#ef4444'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            {lbl('Description')}
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the incident…" rows={3}
              style={{...inp,resize:'vertical'}}
              onFocus={e=>e.target.style.borderColor='#ef4444'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            <button onClick={handleSubmit} disabled={submitting||!form.description.trim()||!form.location.trim()}
              style={{ width:'100%', padding:'12px', background:form.description&&form.location?'linear-gradient(135deg,#ef4444,#dc2626)':'#e2e8f0', color:form.description&&form.location?'#fff':'#94a3b8', border:'none', borderRadius:11, fontWeight:700, fontSize:14, cursor:form.description&&form.location?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', transition:'all 0.2s' }}>
              <Plus size={15}/> {submitting?'Submitting…':'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}