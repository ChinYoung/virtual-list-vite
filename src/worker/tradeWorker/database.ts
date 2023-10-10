import dayjs from "dayjs"
import { NotSyncedError } from "./errors"
import { keyBy } from "lodash"

let database: IDBDatabase | undefined = undefined

const DB_NAME = 'KSE'
const TABLE_NAME = 'Trade'

type TTradePayload = {
  id: number,
  tradeId: string,
  name: string,
  symbol: string,
  trader: string,
  lastPrice: string,
  price: string,
  status: 'VALID' | 'INVALID',
  createAt: string,
  updateAt: string,
  highlighted: boolean,
  deleted?: boolean
}

export function getDbConn(): Promise<IDBDatabase | undefined> {
  return new Promise((resolve) => {
    if (database) {
      resolve(database)
      return
    }
    // change version each time on start up
    const req = indexedDB.open(DB_NAME, dayjs().valueOf())
    req.onupgradeneeded = () => {
      const db = req.result
      if (db.objectStoreNames.contains(TABLE_NAME)) {
        return
      }
      const store = db.createObjectStore(TABLE_NAME, { keyPath: 'id' })
      store.createIndex('remainingRow', ['id', 'deleted'])

    }
    req.onsuccess = () => {
      database = req.result
      resolve(database)
    }
    req.onerror = () => {
      resolve(undefined)
    }
  })
}

// UPDATE
export async function idbUpdate(updates: TTradePayload[]) {
  const db = await getDbConn()
  if (!db) {
    // emit error message here
    return
  }
  const transaction = db.transaction([TABLE_NAME], 'readwrite')
  const store = transaction.objectStore(TABLE_NAME)

  updates.forEach(update => {
    store.put(update)
  })
}

// ADD
export async function idbInsert(newTrades: TTradePayload[]) {
  const db = await getDbConn()
  if (!db) {
    // emit error message here
    return
  }
  const transaction = db.transaction([TABLE_NAME], 'readwrite')
  const store = transaction.objectStore(TABLE_NAME)
  newTrades.forEach(update => {
    store.add(update)
  })
}

// DELETE
export async function idbDelete(deletedTrades: TTradePayload[]) {
  const db = await getDbConn()
  if (!db) {
    // emit error message here
    return
  }
  const transaction = db.transaction([TABLE_NAME], 'readwrite')
  const store = transaction.objectStore(TABLE_NAME)
  deletedTrades.forEach(trade => {
    store.put({ ...trade, deleted: true })
  })
}


// get
export function idbQuery(startIndex: number, endIndex: number): Promise<T[]> {

  return new Promise(resolve => {
    getDbConn().then((db) => {
      if (!db) {
        // emit error message here
        return []
      }
      const toQueryCount = endIndex - startIndex
      const transaction = db.transaction([TABLE_NAME], 'readwrite')
      const store = transaction.objectStore(TABLE_NAME)
      const req = store.index('remainingRow').openCursor()
      const data: TTradePayload[] = [];
      let cursorIndex = 0
      req.onsuccess = (ev) => {
        if (!ev.target) {
          return
        }
        const cur: IDBCursorWithValue = ev.target.result as IDBCursorWithValue

        if (startIndex !== 0 && cursorIndex === 0) {
          cursorIndex = startIndex
          cur.advance(startIndex)
          return
        }
        if (data.length === toQueryCount) {
          resolve(data)
          return
        }

        // 无值且不连续(无删除信息), 请求同步数据
        if (cur === null || data[data.length - 1].id !== cur.value.id) {
          throw new NotSyncedError()
        }
        const val = cur.value as TTradePayload
        !val.deleted && data.push(val);
        cur.continue();
        cursorIndex++
      }
    })
  })
}

export function cacheTrades(trades: TTradePayload[]) {
  getDbConn().then((db) => {
    if (!db) {
      // emit error message here
      return
    }
    const first = trades[0]
    const tradeMap = keyBy(trades, 'id')
    const toCacheCount = trades[trades.length - 1].id - trades[0].id + 1
    const rows = Array
      .from({ length: toCacheCount })
      .map((_i, index) => {
        const rowId = first.id + index
        tradeMap[rowId] ? tradeMap[rowId] : ({ id: rowId, deleted: true })
      })
    const transaction = db.transaction([TABLE_NAME], 'readwrite')
    const store = transaction.objectStore(TABLE_NAME)
    rows.forEach(_i => store.put(_i))
  })
}


