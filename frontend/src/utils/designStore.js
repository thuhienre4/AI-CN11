// Where a teacher's quiz designs live: with the account on the server, so they open on any device, or on this
// device when the app runs without its server. Designs made on a device move to the account at the next
// connection, once.
import { gameDesignsAPI, isBackendUnavailable } from '../services/api'
import { deleteDesign, loadDesigns, saveDesign } from './gameRoom'

export const SOURCE_TEXT = {
  server: 'Lưu với tài khoản: mở được trên mọi thiết bị.',
  device: 'Chưa kết nối máy chủ: thiết kế chỉ lưu trên máy này, sẽ chuyển lên tài khoản khi có kết nối.',
}

const onlineSession = () => {
  const token = globalThis.localStorage?.getItem('token') || ''
  return Boolean(token) && !token.startsWith('local-token-')
}

export const fromServer = (item) => ({
  id: `server-${item.id}`,
  serverId: item.id,
  title: item.title || '',
  questions: (item.questions || []).map((question) => ({
    ...question,
    // the editor always shows four option boxes
    options: [...question.options, '', '', '', ''].slice(0, 4),
  })),
  updatedAt: item.updated_at,
})

const body = (design) => ({ title: design.title || '', questions: design.questions || [] })

/** {designs, source}. Throws only on a real server error, not when the server is simply missing. */
export const fetchDesigns = async (userId, api = gameDesignsAPI) => {
  if (!onlineSession()) return { designs: loadDesigns(userId), source: 'device' }
  try {
    let { data } = await api.list()
    const waiting = loadDesigns(userId)
    if (waiting.length) {
      for (const design of waiting) {
        await api.create(body(design))
        deleteDesign(userId, design.id)
      }
      data = (await api.list()).data
    }
    return { designs: data.map(fromServer), source: 'server' }
  } catch (error) {
    if (isBackendUnavailable(error)) return { designs: loadDesigns(userId), source: 'device' }
    throw error
  }
}

/** Saves a design where the designs came from and returns it as stored (a new one gets its server id). */
export const storeDesign = async (userId, design, source, api = gameDesignsAPI) => {
  if (source === 'server') {
    const { data } = design.serverId ? await api.update(design.serverId, body(design)) : await api.create(body(design))
    return fromServer(data)
  }
  saveDesign(userId, design)
  return design
}

export const removeDesign = async (userId, design, source, api = gameDesignsAPI) => {
  if (source === 'server' && design.serverId) await api.remove(design.serverId)
  else deleteDesign(userId, design.id)
}

export const copyOf = (design) => ({
  id: `game-${Date.now().toString(36)}`,
  title: `${design.title || 'Chưa đặt tên'} (bản sao)`.slice(0, 120),
  questions: design.questions.map((question) => ({ ...question, options: [...question.options] })),
})
