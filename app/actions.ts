'use server'
import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function hideAccount(id: string) {
  const db = createServerClient()
  await db.from('accounts').update({ hidden: true }).eq('id', id)
  revalidatePath('/')
}

export async function deleteFD(id: string) {
  const db = createServerClient()
  await db.from('fixed_deposits').delete().eq('id', id)
  revalidatePath('/')
}
