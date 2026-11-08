import { describe, expect, it } from 'vitest'
import { canActAsTeacher, canDeleteMaterial, isVerifiedTeacher } from './roles'

describe('teacher tools in the interface', () => {
  it('are shown only to staff accounts that have been verified', () => {
    expect(canActAsTeacher({ role: 'teacher', account_status: 'verified' })).toBe(true)
    expect(canActAsTeacher({ role: 'admin', account_status: 'verified' })).toBe(true)
    expect(canActAsTeacher({ role: 'teacher', account_status: 'pending' })).toBe(false)
    expect(canActAsTeacher({ role: 'teacher', account_status: 'rejected' })).toBe(false)
    expect(canActAsTeacher({ role: 'student', account_status: 'verified' })).toBe(false)
    expect(canActAsTeacher(null)).toBe(false)
  })

  it('treat accounts without a status (older accounts, offline demo) as verified', () => {
    expect(canActAsTeacher({ role: 'teacher' })).toBe(true)
    expect(isVerifiedTeacher({ role: 'teacher' })).toBe(true)
  })

  it('keep class tools to verified teachers, not administrators', () => {
    expect(isVerifiedTeacher({ role: 'teacher', account_status: 'verified' })).toBe(true)
    expect(isVerifiedTeacher({ role: 'admin', account_status: 'verified' })).toBe(false)
    expect(isVerifiedTeacher({ role: 'teacher', account_status: 'pending' })).toBe(false)
  })
})

describe('deleting a reference material', () => {
  const teacher = { id: 7, role: 'teacher', account_status: 'verified' }
  it('is offered to its uploader and to administrators only, as the server allows', () => {
    expect(canDeleteMaterial(teacher, { id: 1, uploader_user_id: 7 })).toBe(true)
    expect(canDeleteMaterial(teacher, { id: 1, uploader_user_id: 8 })).toBe(false)
    expect(canDeleteMaterial({ id: 9, role: 'admin' }, { id: 1, uploader_user_id: 8 })).toBe(true)
    expect(canDeleteMaterial({ ...teacher, account_status: 'pending' }, { id: 1, uploader_user_id: 7 })).toBe(false)
    expect(canDeleteMaterial({ id: 3, role: 'student' }, { id: 1, uploader_user_id: 3 })).toBe(false)
  })
  it('lets anyone remove materials kept only on their own device', () => {
    expect(canDeleteMaterial({ id: 3, role: 'student' }, { id: 'local-material-1' })).toBe(true)
  })
})
