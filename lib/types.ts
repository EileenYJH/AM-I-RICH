export interface Account {
  id: string
  name: string
  institution: string
  type: 'bank' | 'ewallet' | 'savings'
  color: string
  balance: number
  updated_at: string
}

export interface Transaction {
  id: string
  account_id: string
  amount: number
  merchant: string
  category: string
  date: string
  source: 'screenshot' | 'manual'
  created_at: string
  account?: Account
}

export interface FixedDeposit {
  id: string
  institution: string
  principal: number
  interest_rate: number
  placement_date: string
  maturity_date: string
  interest_amount: number
  total_at_maturity: number
  status: 'active' | 'matured'
  created_at: string
}

export interface ParseResult {
  institution: string
  accountName: string
  balance: number
  transactions: ParsedTransaction[]
}

export interface ParsedTransaction {
  amount: number
  merchant: string
  date: string
  type: 'debit' | 'credit'
}

export interface FDParseResult {
  institution: string
  principal: number
  interestRate: number
  placementDate: string
  maturityDate: string
  interestAmount: number
  totalAtMaturity: number
}

export type DetectorResult =
  | { type: 'account'; result: ParseResult }
  | { type: 'fd'; result: FDParseResult }
  | { type: 'unrecognised' }
  | { type: 'parse_failed'; institution: string }
