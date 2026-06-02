'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/',         label: 'Dashboard', icon: '⊟' },
  { href: '/spending', label: 'Spending',  icon: '↕' },
  { href: '/monthly',  label: 'Monthly',   icon: '◷' },
  { href: '/add',      label: 'Add',       icon: '⊕' },
]

export default function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-black/5 flex" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      {TABS.map(tab => {
        const active = path === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${active ? 'text-[#6C63FF]' : 'text-[#B0B5C8]'}`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            {tab.label}
            {active && <span className="w-1 h-1 rounded-full bg-[#6C63FF] mt-0.5" />}
          </Link>
        )
      })}
    </nav>
  )
}
