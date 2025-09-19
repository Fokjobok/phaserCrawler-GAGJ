import moduleChances from "../database/exploration/module_chances.js"
import moduleBio from "../database/exploration/module_bio.js"
import moduleSecret from "../database/exploration/module_secret.js"

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function randOf(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const MODULE_IMAGES = [
  'module_01.webp','module_02.webp','module_03.webp','module_04.webp','module_05.webp',
  'module_06.webp','module_07.webp','module_08.webp','module_09.webp','module_10.webp'
]
const CORRIDOR_IMAGES = [
  'corridor_01.webp','corridor_02.webp','corridor_03.webp','corridor_04.webp','corridor_05.webp','corridor_06.webp','corridor_07.webp'
]

function bag(images) { return { pool: [...images], take() { if (!this.pool.length) this.pool = [...images]; const i = Math.floor(Math.random() * this.pool.length); return this.pool.splice(i,1)[0] } } }

function pickEvent(prob) {
  const pe = (prob?.chance_enemy ?? 0) / 100
  const pt = (prob?.chance_trap ?? 0) / 100
  const pv = (prob?.chance_event ?? 0) / 100
  const none = Math.max(0, 1 - (pe + pt + pv))
  const r = Math.random()
  if (r < none) return 'ninguno'
  if (r < none + pe) return 'enemigo'
  if (r < none + pe + pt) return 'trampa'
  return 'evento'
}

function randomBio(kind) {
  const key = kind === 'ninguno' ? 'common' : kind
  const lines = moduleBio[key]?.lines || moduleBio.common.lines
  return randOf(lines)
}

function randomSecretHint() {
  const lines = moduleSecret.secret?.lines || ["Parece haber algo oculto aquí..."]
  return randOf(lines)
}

function bfsFarthest(startId, graph) {
  const q = [startId]
  const dist = { [startId]: 0 }
  let far = startId
  while (q.length) {
    const u = q.shift()
    for (const v of (graph[u] || [])) {
      if (dist[v] == null) {
        dist[v] = dist[u] + 1
        q.push(v)
        if (dist[v] > dist[far]) far = v
      }
    }
  }
  return { farthestId: far, dist }
}

export function buildDungeon({ level = 1, biome = 'mazmorra' } = {}) {
  // Número de módulos = nivelBase * 2 + 5, min 10, max 50
  const nodeCount = clamp(level * 2 + 5, 10, 50)
  const biomeCfg = moduleChances[biome] || moduleChances['mazmorra']
  const roomProb = biomeCfg['habitacion']?.stats || biomeCfg['camara']?.stats || { chance_enemy: 40, chance_trap: 10, chance_event: 10 }
  const hallProb = biomeCfg['pasillo']?.stats || biomeCfg['galeria']?.stats || { chance_enemy: 50, chance_trap: 10, chance_event: 10 }

  const mBag = bag(MODULE_IMAGES)
  const cBag = bag(CORRIDOR_IMAGES)

  const modules = []
  for (let i = 1; i <= nodeCount; i++) {
    const ev = pickEvent(roomProb)
    modules.push({
      id: i,
      type: 'habitacion',
      image: mBag.take(),
      event: ev,
      bio: randomBio(ev),
      explored: false,
      resolved: false,
      isBoss: false,
      isChest: false,
      hasSecretEntrance: false,
      secretHint: ''
    })
  }
  // avoid enemy at entrance
  if (modules[0].event === 'enemigo') { modules[0].event = 'ninguno'; modules[0].bio = randomBio('common') }

  const corridors = []
  const adj = {}
  for (let i = 1; i <= nodeCount; i++) adj[i] = []

  function connect(a, b, hidden=false) {
    const len = Math.floor(Math.random()*3) + 1 // 1..3
    const parts = Array.from({ length: len }, (_, k) => ({ part: k+1, event: pickEvent(hallProb), resolved: false }))
    const images = parts.map(() => cBag.take())
    corridors.push({ from: a, to: b, parts, images, bio: randomBio(randOf(parts).event), hidden, revealed: !hidden })
    adj[a].push(b)
    adj[b].push(a)
  }

  // linear spine
  for (let i = 1; i < nodeCount; i++) connect(i, i+1, false)

  // up to 2 extra cycles as secrets
  const extra = Math.min(2, Math.max(0, Math.floor(nodeCount / 10)))
  for (let k = 0; k < extra; k++) {
    const a = Math.floor(Math.random()*(nodeCount-3)) + 1
    let b = Math.floor(Math.random()*(nodeCount - (a+2))) + (a+2)
    connect(a, b, true)
    const mA = modules[a-1]
    mA.event = 'evento'
    mA.hasSecretEntrance = true
    mA.secretHint = randomSecretHint()
    mA.bio = randomBio('evento')
  }

  // Boss: farthest from 1
  const { farthestId } = bfsFarthest(1, adj)
  const boss = modules[farthestId - 1]
  boss.event = 'jefe'
  boss.isBoss = true
  boss.resolved = false
  boss.bio = randomBio('enemigo')

  // Ensure chest, trap, event
  const nonBoss = modules.filter(m => !m.isBoss)
  if (!modules.some(m => m.event === 'trampa')) {
    const m = randOf(nonBoss); m.event = 'trampa'; m.bio = randomBio('trampa')
  }
  if (!modules.some(m => m.event === 'evento' && !m.isChest && !m.isBoss)) {
    const m = randOf(nonBoss); m.event = 'evento'; m.isChest = false; m.bio = randomBio('evento')
  }
  if (!modules.some(m => m.isChest)) {
    const m = randOf(nonBoss); m.event = 'evento'; m.isChest = true; m.bio = randomBio('evento')
  }

  return { modules, corridors, adj }
}
