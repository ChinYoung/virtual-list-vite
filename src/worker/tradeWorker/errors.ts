export class NotSyncedError extends Error {
  constructor() {
    super()
    this.message = 'value is not synced'
  }
}

export class NoNeedToUpdateError extends Error {
  constructor() {
    super()
    this.message = 'there is no need to update'
  }
}
