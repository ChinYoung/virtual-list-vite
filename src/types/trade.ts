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
  index: number
  name: string
  symbol: string
  trader: string
  price: number
  lastPrice: number
  trend: ETrend
  status: EStatus
  updateAt: number
  createAt: number
}