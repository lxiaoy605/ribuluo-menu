// POST /api/notify — Telegram 订单通知
// Body: { order, action, messageId? }

import { createClient } from '@supabase/supabase-js'

const SUPA_URL = process.env.SUPABASE_URL || 'https://ociyiskgwmgcndedhjyv.supabase.co'
const SUPA_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_xU7_B3K38yllhW4KBTE-pg_m8OYwBST'
const TG_API = 'https://api.telegram.org'

function escapeMD(text) {
  return String(text || '').replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}

/** 格式化完整订单消息 */
function fmtOrder(order) {
  const e = escapeMD
  const lines = []
  lines.push(`🆕 *新订单* \\#${e(order.id)}`)
  lines.push('')
  if (order.customerName) lines.push(`👤 顾客: ${e(order.customerName)}`)
  lines.push(`📞 联系: ${e(order.contactType)} \\/ ${e(order.contactInfo)}`)
  lines.push(`👥 人数: ${order.guestCount || 1}人`)
  lines.push(`📍 方式: ${order.orderMode === 'delivery' ? '配送' : '到店'}`)
  if (order.orderMode === 'delivery' && order.deliveryAddress) {
    lines.push(`🏠 地址: ${e(order.deliveryAddress)}`)
  }
  if (order.expectedTime) lines.push(`🕐 预期: ${e(order.expectedTime)}`)
  lines.push('')
  lines.push('📋 *菜品:*')
  ;(order.items || []).forEach(item => {
    const name = typeof item.name === 'string' ? item.name : (item.name?.zh || item.name?.en || '-')
    lines.push(`  \\- ${e(name)} x${item.qty}  \\֏ ${(item.price * item.qty).toLocaleString()}`)
  })
  const total = (order.items || []).reduce((s, i) => s + i.price * i.qty, 0)
  lines.push(`  ──────────────`)
  lines.push(`  *合计: \\֏ ${total.toLocaleString()}*`)
  if (order.deliveryFee) lines.push(`  🚚 配送费: \\֏ ${order.deliveryFee.toLocaleString()}`)
  if (order.notes) lines.push(`\n📝 备注: ${e(order.notes)}`)
  const st = order.status === 'completed' ? '已完成' : '待处理'
  lines.push(`\n📌 状态: ${st}`)
  return lines.join('\n')
}

/** 顾客修改时的简短变更摘要（新旧对比） */
function fmtChangeSummary(order, oldItems) {
  const e = escapeMD
  const total = (order.items || []).reduce((s, i) => s + i.price * i.qty, 0)
  const oldTotal = (oldItems || []).reduce((s, i) => s + i.price * i.qty, 0)
  const diff = total - oldTotal

  const itemName = (item) => typeof item.name === 'string' ? item.name : (item.name?.zh || item.name?.en || '-')

  const lines = [`✏️ *订单已变更* \\#${e(order.id)}`]

  if (oldItems && oldItems.length > 0) {
    // 对比新旧
    const oldMap = new Map(oldItems.map(i => [i.id, i]))
    const newMap = new Map((order.items || []).map(i => [i.id, i]))

    for (const [id, ni] of newMap) {
      const oi = oldMap.get(id)
      if (!oi) {
        // 新增
        lines.push(`  加菜 ${e(itemName(ni))} x${ni.qty}  \\֏ ${(ni.price * ni.qty).toLocaleString()}`)
      } else if (oi.qty !== ni.qty) {
        // 数量变化
        const cDiff = ni.price * ni.qty - oi.price * oi.qty
        const label = cDiff >= 0 ? '加菜' : '减菜'
        lines.push(`  ${label} ${e(itemName(ni))} ${oi.qty} → ${ni.qty}  \\֏ ${Math.abs(cDiff).toLocaleString()}`)
        oldMap.delete(id)
      } else {
        oldMap.delete(id)
      }
    }
    // 被移除的
    for (const [, oi] of oldMap) {
      lines.push(`  减菜 ${e(itemName(oi))} x${oi.qty}  \\֏ ${(oi.price * oi.qty).toLocaleString()}`)
    }

    lines.push('')
    if (diff > 0) lines.push(`合计: \\֏ ${total.toLocaleString()}  （加菜 \\֏ ${diff.toLocaleString()}）`)
    else if (diff < 0) lines.push(`合计: \\֏ ${total.toLocaleString()}  （减菜 \\֏ ${Math.abs(diff).toLocaleString()}）`)
    else lines.push(`合计: \\֏ ${total.toLocaleString()}  （不变）`)
  } else {
    lines.push(`合计: \\֏ ${total.toLocaleString()}`)
  }

  return lines.join('\n')
}

/** 状态变更通知 */
function fmtStatusChange(order) {
  const e = escapeMD
  const st = order.status === 'completed' ? '✅ 已完成' : '🔄 已撤回'
  return `${st} \\#${e(order.id)}`
}

/** 调用 Telegram API */
async function tgCall(token, method, body) {
  const resp = await fetch(`${TG_API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return resp.json()
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    // 从 Supabase 读取配置
    const supabase = createClient(SUPA_URL, SUPA_KEY)
    const { data: row, error: cfgErr } = await supabase
      .from('menu_config')
      .select('data')
      .eq('id', 1)
      .single()

    if (cfgErr || !row?.data) {
      return res.status(200).json({ skipped: true, reason: 'no config' })
    }

    const cfg = row.data
    const token = cfg.telegramBotToken
    const chatId = cfg.telegramChatId
    const enabled = cfg.telegramNotificationsEnabled

    if (!token || !chatId || !enabled) {
      return res.status(200).json({ skipped: true, reason: 'not configured' })
    }

    const { order, action, messageId, oldItems } = req.body
    if (!action) {
      return res.status(400).json({ error: 'missing action' })
    }
    if (action !== 'test' && !order) {
      return res.status(400).json({ error: 'missing order' })
    }

    let result

    switch (action) {
      case 'new': {
        // 新订单：发完整消息
        const text = fmtOrder(order)
        result = await tgCall(token, 'sendMessage', {
          chat_id: chatId,
          text,
          parse_mode: 'MarkdownV2'
        })
        if (!result.ok) {
          console.error('Telegram sendMessage failed:', result)
          return res.status(502).json({ error: result.description })
        }
        return res.status(200).json({ message_id: result.result.message_id })
      }

      case 'customer_update': {
        // 顾客修改：编辑原消息 + 发简短回复通知
        let currentMsgId = messageId
        let edited = false
        if (currentMsgId) {
          const text = fmtOrder(order)
          const editR = await tgCall(token, 'editMessageText', {
            chat_id: chatId,
            message_id: currentMsgId,
            text,
            parse_mode: 'MarkdownV2'
          })
          edited = editR.ok
          if (!edited) {
            console.error('editMessageText failed, fallback to new message:', editR)
            // 回退：发新消息
            const fbR = await tgCall(token, 'sendMessage', {
              chat_id: chatId,
              text,
              parse_mode: 'MarkdownV2'
            })
            if (fbR.ok) currentMsgId = fbR.result.message_id
          }
        } else {
          // 无 messageId（旧订单），发新消息
          const text = fmtOrder(order)
          const newR = await tgCall(token, 'sendMessage', {
            chat_id: chatId,
            text,
            parse_mode: 'MarkdownV2'
          })
          if (newR.ok) currentMsgId = newR.result.message_id
        }

        // 发简短变更回复（铃声提醒）
        if (cfg.telegramNotifyOnCustomerUpdate !== false) {
          const summary = fmtChangeSummary(order, oldItems)
          const replyR = await tgCall(token, 'sendMessage', {
            chat_id: chatId,
            text: summary,
            parse_mode: 'MarkdownV2',
            reply_to_message_id: currentMsgId || undefined
          })
          if (replyR.ok) {
            return res.status(200).json({ message_id: currentMsgId, reply_message_id: replyR.result.message_id })
          } else {
            console.error('sendMessage reply failed:', replyR)
            return res.status(200).json({ message_id: currentMsgId })
          }
        }
        return res.status(200).json({ message_id: currentMsgId })
      }

      case 'admin_update': {
        // 管理端编辑：仅编辑原消息（不通知）
        if (!messageId) {
          return res.status(200).json({ skipped: true, reason: 'no message_id' })
        }
        const text = fmtOrder(order)
        result = await tgCall(token, 'editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: 'MarkdownV2'
        })
        if (!result.ok) {
          // fallback: 发新消息
          const fbR = await tgCall(token, 'sendMessage', {
            chat_id: chatId,
            text,
            parse_mode: 'MarkdownV2'
          })
          if (fbR.ok) return res.status(200).json({ message_id: fbR.result.message_id, fallback: true })
          return res.status(502).json({ error: result.description })
        }
        return res.status(200).json({ message_id: messageId })
      }

      case 'status_change': {
        // 结算/撤回：编辑原消息 + 发状态变更通知
        let editedMsgId = messageId
        if (messageId) {
          const text = fmtOrder(order)
          const editR = await tgCall(token, 'editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text,
            parse_mode: 'MarkdownV2'
          })
          if (!editR.ok) {
            // fallback: 发新消息
            const fbR = await tgCall(token, 'sendMessage', {
              chat_id: chatId,
              text,
              parse_mode: 'MarkdownV2'
            })
            if (fbR.ok) editedMsgId = fbR.result.message_id
          }
        }

        // 发状态变更通知（铃声）
        if (cfg.telegramNotifyOnStatusChange !== false) {
          const sc = fmtStatusChange(order)
          await tgCall(token, 'sendMessage', {
            chat_id: chatId,
            text: sc,
            parse_mode: 'MarkdownV2',
            reply_to_message_id: editedMsgId || undefined
          })
        }
        return res.status(200).json({ message_id: editedMsgId })
      }

      case 'test': {
        // 测试通知
        const text = `🧪 *测试通知*\nTelegram 订单通知配置成功！\\n\\n订单号: \\#TEST\\n时间: ${new Date().toLocaleString()}`
        result = await tgCall(token, 'sendMessage', {
          chat_id: chatId,
          text,
          parse_mode: 'MarkdownV2'
        })
        if (!result.ok) {
          return res.status(502).json({ error: result.description || 'Telegram API error' })
        }
        return res.status(200).json({ ok: true, message_id: result.result.message_id })
      }

      default:
        return res.status(400).json({ error: 'unknown action' })
    }
  } catch (err) {
    console.error('api/notify error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
