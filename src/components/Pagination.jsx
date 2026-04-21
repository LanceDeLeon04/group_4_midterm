import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const btn = (active, disabled, content, onClick) => (
    <button onClick={onClick} disabled={disabled}
      style={{ minWidth:34, height:34, borderRadius:8, border:`1.5px solid ${active?'#4f46e5':'#e2e8f0'}`, background:active?'#4f46e5':'#fff', color:active?'#fff':disabled?'#cbd5e1':'#475569', fontWeight:active?700:500, fontSize:13, cursor:disabled?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', padding:'0 6px' }}
      onMouseEnter={e=>{ if(!active&&!disabled){e.currentTarget.style.background='#eef2ff';e.currentTarget.style.borderColor='#4f46e5';e.currentTarget.style.color='#4f46e5';}}}
      onMouseLeave={e=>{ if(!active&&!disabled){e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#475569';}}}>
      {content}
    </button>
  );
  return (
    <div style={{ display:'flex', gap:5, alignItems:'center', justifyContent:'center', marginTop:24 }}>
      {btn(false, currentPage===1, <ChevronLeft size={15}/>, ()=>onPageChange(currentPage-1))}
      {Array.from({length:totalPages},(_,i)=>i+1).map(p=>btn(p===currentPage,false,p,()=>onPageChange(p)))}
      {btn(false, currentPage===totalPages, <ChevronRight size={15}/>, ()=>onPageChange(currentPage+1))}
    </div>
  );
}