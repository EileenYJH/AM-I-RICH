import { createServerClient } from '@/lib/supabase'
import NetWorthBanner from '@/components/NetWorthBanner'
import AccountCard from '@/components/AccountCard'
import SavingsCard from '@/components/SavingsCard'
import FDCard from '@/components/FDCard'

export const revalidate = 60

export default async function Dashboard() {
  const db = createServerClient()

  const [{ data: accounts }, { data: fds }] = await Promise.all([
    db.from('accounts').select('*').eq('hidden', false).order('type').order('institution'),
    db.from('fixed_deposits').select('*').eq('status', 'active').order('maturity_date'),
  ])

  const bankAndEwallet = (accounts ?? []).filter(a => a.type === 'bank' || a.type === 'ewallet')
  const savings = (accounts ?? []).filter(a => a.type === 'savings')
  const activeFDs = fds ?? []

  const totalAccounts = (accounts ?? []).reduce((s, a) => s + Number(a.balance), 0)
  const totalFDs = activeFDs.reduce((s, f) => s + Number(f.principal), 0)
  const total = totalAccounts + totalFDs

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="pt-2">
      <div className="flex justify-between items-center px-4 pb-2">
        <div>
          <p className="text-xs text-[#8B90A7]">{greeting},</p>
          <p className="text-xl font-extrabold text-[#1A1C2E] tracking-tight">Am I Rich? 💰</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#4ECDC4] flex items-center justify-center text-white font-bold text-sm">
          E
        </div>
      </div>

      <NetWorthBanner total={total} accountCount={(accounts?.length ?? 0) + activeFDs.length} />

      <p className="px-4 pt-4 pb-2 text-[10px] font-bold tracking-widest uppercase text-[#8B90A7]">
        Accounts &amp; eWallets
      </p>
      <div className="px-3.5 grid grid-cols-3 gap-2">
        {bankAndEwallet.map(acc => <AccountCard key={acc.id} account={acc} />)}
      </div>

      {(savings.length > 0 || activeFDs.length > 0) && (
        <>
          <p className="px-4 pt-4 pb-2 text-[10px] font-bold tracking-widest uppercase text-[#8B90A7]">
            Savings &amp; Investments
          </p>
          <div className="px-3.5 grid grid-cols-2 gap-2">
            {savings.map(acc => <SavingsCard key={acc.id} account={acc} />)}
            {activeFDs.map(fd => <FDCard key={fd.id} fd={fd} />)}
          </div>
        </>
      )}
    </div>
  )
}
