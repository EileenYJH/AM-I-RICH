const KEYWORDS: Record<string, string[]> = {
  food: ['tealive', 'mcdonald', 'kfc', 'subway', 'starbucks', 'grabfood', 'foodpanda',
         'chatime', 'pizza', 'burger', 'restaurant', 'cafe', 'bakery', 'kopitiam',
         'mamak', 'secret recipe', 'old town', 'sushi', 'nando', 'marrybrown'],
  transport: ['grab', 'rapidkl', 'lrt', 'mrt', 'ktm', 'shell', 'petronas', 'caltex',
              'petron', 'plus', 'parking', 'toll', 'myrapid'],
  shopping: ['shopee', 'lazada', 'aeon', 'tesco', 'mydin', 'giant', 'lotus',
             'parkson', 'padini', 'uniqlo', 'h&m', 'zalora'],
  bills: ['tnb', 'tenaga', 'syabas', 'air selangor', 'maxis', 'celcom', 'digi',
          'unifi', 'time dotcom', 'streamyx', 'insurance', 'takaful'],
  income: ['salary', 'gaji', 'bonus', 'dividend', 'dividen', 'interest', 'faedah'],
}

export function categorise(merchant: string): string {
  const lower = merchant.toLowerCase()
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    if (kws.some(kw => lower.includes(kw))) return cat
  }
  return 'other'
}
