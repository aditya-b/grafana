// Constants that both app and workers need, since workers can import from
// the app but the app can't import from a worker.

export enum StreamJSONCommandIn {
  Abort,
}

export enum StreamJSONCommandOut {
  Done,
}
