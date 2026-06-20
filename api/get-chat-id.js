// POST /api/get-chat-id — 获取最近 Telegram 对话的 chat_id

import { createClient } from '@supabase/supabase-js'

const SUPA_URL = process.env.SUPABASE_URL || 'https://ociyiskgwmgcndedhjyv.supabase.co'
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_xU7_B3K38yllhW4KBTE-pg_m8OYwBST'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const supabase = createClient(SUPA_URL, SUPA_KEY)

    let token = req.body?.token || ''
    if (!token) {
      const { data: row, error: cfgErr } = await supabase
        .from('menu_config')
        .select('data')
        .eq('id', 1)
        .single()

      if (cfgErr || !row?.data) {
        return res.status(400).json({ error: '请先配置 Bot Token' })
      }
      token = row.data.telegramBotToken
    }

    if (!token) {
      return res.status(400).json({ error: '请先保存 Bot Token' })
    }

    const resp = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=5`)
    const data = await resp.json()

    if (!data.ok) {
      return res.status(502).json({ error: data.description || 'Telegram API 错误' })
    }

    const updates = data.result || []
    if (!updates.length) {
      return res.status(200).json({ error: '未收到任何消息，请先给 Bot 发送一条消息' })
    }

    // 收集所有唯一的 chat，包含类型信息（兼容 message/channel_post/my_chat_member 等事件）
    const chatMap = new Map()
    for (const u of updates) {
      // Telegram 不同类型的事件 chat 字段位置不同
      const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat || u.chat_member?.chat || u.chat_join_request?.chat
      if (!chat?.id) continue
      if (!chatMap.has(chat.id)) {
        chatMap.set(chat.id, { id: chat.id, type: chat.type || 'private', title: chat.title || null })
      }
    }
    const chats = [...chatMap.values()]

    if (!chats.length) {
      return res.status(200).json({ error: '未能提取 chat_id，请确认已给 Bot 发送消息' })
    }

    return res.status(200).json({ chats, latest: chats[0].id })
  } catch (err) {
    console.error('api/get-chat-id error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
