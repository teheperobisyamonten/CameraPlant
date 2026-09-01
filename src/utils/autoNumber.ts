/** 0 -> 'A', 25 -> 'Z', 26 -> 'AA', 27 -> 'AB', ... (spreadsheet-column style) */
export function indexToLetters(index: number): string {
  let n = index
  let result = ''
  do {
    result = String.fromCharCode(65 + (n % 26)) + result
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return result
}

export function autoName(prefix: string, index: number): string {
  return `${prefix} ${indexToLetters(index)}`
}
