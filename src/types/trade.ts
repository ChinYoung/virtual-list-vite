export enum ETrend {
  UP = 'Up',
  DOWN = 'Down',
  STEADY = 'Steady'
}

export enum EStatus {
  VALID = 'Valid',
  INVALID = 'Invalid'
}

export type TTrade = {
  id: string
  tradeId: string
  name: string
  symbol: string
  trader: string
  price: string
  prevPrice: string
  status: EStatus
  updatedAt: number
  createdAt: number
}
