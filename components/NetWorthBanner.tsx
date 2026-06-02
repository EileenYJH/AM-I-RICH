export default function NetWorthBanner({ total, accountCount }: { total: number; accountCount: number }) {
  return (
    <div className="mx-3.5 mt-1 rounded-[18px] p-4 bg-[#1A1C2E] relative overflow-hidden shadow-lg">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#6C63FF]/20 blur-2xl pointer-events-none" />
      <p className="text-[10px] font-bold tracking-widest uppercase text-white/40">Total Net Worth</p>
      <p className="text-[30px] font-extrabold text-white tracking-tight mt-1 leading-none">
        RM {total.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[11px] text-white/35 mt-1">Across {accountCount} accounts</p>
    </div>
  )
}
