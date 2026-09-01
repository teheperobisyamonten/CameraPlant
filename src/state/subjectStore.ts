import { create } from 'zustand'
import type { SubjectInstance } from '../types/subject'
import { autoName } from '../utils/autoNumber'

interface SubjectState {
  subjects: SubjectInstance[]
  /** Monotonically increasing; not derived from array length so names stay unique after deletes. */
  nextNameIndex: number
  addSubject: (position: { x: number; y: number }) => string
  updateSubject: (id: string, patch: Partial<Omit<SubjectInstance, 'id'>>) => void
  removeSubject: (id: string) => void
}

export const useSubjectStore = create<SubjectState>((set, get) => ({
  subjects: [],
  nextNameIndex: 0,

  addSubject: (position) => {
    const id = crypto.randomUUID()
    const { nextNameIndex } = get()
    const subject: SubjectInstance = {
      id,
      name: autoName('Subject', nextNameIndex),
      type: 'person',
      x: position.x,
      y: position.y,
      rotationDeg: 0,
    }
    set((s) => ({ subjects: [...s.subjects, subject], nextNameIndex: s.nextNameIndex + 1 }))
    return id
  },

  updateSubject: (id, patch) => {
    set((s) => ({
      subjects: s.subjects.map((subject) => (subject.id === id ? { ...subject, ...patch } : subject)),
    }))
  },

  removeSubject: (id) => {
    set((s) => ({ subjects: s.subjects.filter((subject) => subject.id !== id) }))
  },
}))
