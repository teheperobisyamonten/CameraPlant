export interface FloorMapImage {
  element: HTMLImageElement
  /** Kept so the map can be re-saved to IndexedDB (the <img> element alone isn't serializable). */
  blob: Blob
  width: number
  height: number
}
