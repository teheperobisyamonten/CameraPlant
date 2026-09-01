import { describe, expect, it } from 'vitest'
import { autoName, indexToLetters } from './autoNumber'

describe('indexToLetters', () => {
  it('maps 0-25 to A-Z', () => {
    expect(indexToLetters(0)).toBe('A')
    expect(indexToLetters(1)).toBe('B')
    expect(indexToLetters(25)).toBe('Z')
  })

  it('wraps to AA, AB after Z', () => {
    expect(indexToLetters(26)).toBe('AA')
    expect(indexToLetters(27)).toBe('AB')
  })
})

describe('autoName', () => {
  it('prefixes the letter index', () => {
    expect(autoName('Camera', 0)).toBe('Camera A')
    expect(autoName('Subject', 2)).toBe('Subject C')
  })
})
