// 订单变更提示音（Web Audio API）
// 浏览器自动播放限制：AudioContext 初始为 suspended，需用户交互后 resume。
// 管理员进入后台时必然有点击操作，所以首次交互后自动激活。

let ctx = null
let enabled = false

function ensureCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)() } catch (e) { return null }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

function beep(freq, duration, type = 'square') {
  const c = ensureCtx()
  if (!c || !enabled) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.15, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

export function useAlertSound() {
  // 在任意用户交互时调用一次即可激活
  function activate() {
    if (enabled) return
    const c = ensureCtx()
    if (c) {
      enabled = true
      // 静默发出一声极短促的音频以解锁 AudioContext
      beep(880, 0.01)
    }
  }

  function playAlert() {
    if (!enabled) return
    // 三声短促提示音
    const c = ensureCtx()
    if (!c) return
    const now = c.currentTime
    ;[880, 1100, 1320].forEach((freq, i) => {
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      const t = now + i * 0.2
      gain.gain.setValueAtTime(0.12, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      osc.connect(gain)
      gain.connect(c.destination)
      osc.start(t)
      osc.stop(t + 0.15)
    })
  }

  return { activate, playAlert }
}
