import CONFIG from '../../config/config.js'
import { job_stats } from '../character/player_db.js'



export class Player {
    constructor(name, job, level = 1, fatigue = 5, affinity = 5, weaponDb = {}, shieldDb = {}, armorDb = {}, accessoryDb = {}) {
        console.log(`Inicializando Player: ${name} con job: ${job}`)

        this.name = name
        this.status = null
        this.job = job.toLowerCase()
        this.battle_image = job_stats[this.job]?.battle_image || '_idle'
        this.level = level
        this.fatigue = fatigue
        this.max_fatigue = 5
        this.gold = 1000
        this.inventory = []

        // Registro de misiones
        this.quests = []




        // Color
        const jobData = job_stats[this.job] || {}
        const colorKey = jobData.color || "gray"
        this.color = CONFIG.COLOR_MAP[colorKey] || [200, 200, 200]
        this.bgcolor = CONFIG.COLOR_MAP[colorKey + "_pastel"] || [200, 200, 200, 0.6]
        

        // Bases de datos
        this.weaponDb = weaponDb
        this.shieldDb = shieldDb
        this.armorDb = armorDb
        this.accessoryDb = accessoryDb

        // Equipamiento
        this.weapon = null
        this.shield = null
        this.armor = null
        this.accessory = null
        
        this.assignDefaultGear()

        console.log("Player: Gear asignado", {
            weapon: this.weapon,
            shield: this.shield,
            armor: this.armor,
            accessory: this.accessory
        })

        this.addStats()
        this.calcStats()
    }

    addToInventory(item) {
        this.inventory.push(item)
    }


    removeFromInventory(item) {
        const index = this.inventory.indexOf(item)
        if (index !== -1) {
            this.inventory.splice(index, 1)
        }
    }

    assignDefaultGear() {
        const gear = (job_stats[this.job] && job_stats[this.job].gear) || {}
        console.log("assignDefaultGear: gear extraído de job_stats", gear)
        console.log("assignDefaultGear: Keys de weaponDb", Object.keys(this.weaponDb))
        console.log("assignDefaultGear: Keys de shieldDb", Object.keys(this.shieldDb))
        console.log("assignDefaultGear: Keys de armorDb", Object.keys(this.armorDb))
        console.log("assignDefaultGear: Keys de accessoryDb", Object.keys(this.accessoryDb))
    
        // Equipa el arma si existe
        const weapon_name = gear.weapon || ''

        if (weapon_name && this.weaponDb[weapon_name]) {
            this.equipWeapon(weapon_name)

        } else {
            if (weapon_name) console.log(`Error: El arma '${weapon_name}' no existe en la base de datos.`)

        }
    
        // Equipa el escudo si existe
        const shield_name = gear.shield || ''
        if (shield_name && this.shieldDb[shield_name]) {
            this.equipShield(shield_name)

        } else {
            if (shield_name) console.log(`Error: El escudo '${shield_name}' no existe en la base de datos.`)

        }
    
        // Equipa la armadura si existe
        const armor_name = gear.armor || ''
        if (armor_name && this.armorDb[armor_name]) {
            this.equipArmor(armor_name)

        } else {
            if (armor_name) console.log(`Error: La armadura '${armor_name}' no existe en la base de datos.`)

        }
    
        // Equipa el accesorio si existe
        const accessory_name = gear.accessory || ''
        if (accessory_name && this.accessoryDb[accessory_name]) {
            this.equipAccessory(accessory_name)

        } else {
            if (accessory_name) console.log(`Error: El accesorio '${accessory_name}' no existe.`)

        }
    }

    getColor(name, alpha = 128) {
        const rgb = CONFIG.COLOR_MAP[name] || [200, 200, 200] // Color gris por defecto

        return [...rgb, alpha]
    }

    addStats() {
        // Usa job_stats[this.job]
        const jobData = job_stats[this.job]

        if (!jobData) {
            console.error(`No se encontró el job: ${this.job}`)

            return
        }
        const stats = jobData.stats || {}
        const required_keys = ['str', 'vit', 'agi', 'dex', 'wis', 'sou']

        for (const key of required_keys) {
            if (!(key in stats)) {
                throw new Error(`Falta la estadística ${key} para la clase ${this.job}.`)

            }
        }

        this.str = stats.str
        this.vit = stats.vit
        this.agi = stats.agi
        this.dex = stats.dex
        this.wis = stats.wis
        this.sou = stats.sou

        console.log(`Estadísticas añadidas: STR=${this.str}, VIT=${this.vit}, AGI=${this.agi}, DEX=${this.dex}, WIS=${this.wis}, SOU=${this.sou}`)
    }
        

    getColorAsHex() {
        if (!this.color || this.color.length !== 3) {
            console.error("❌ Error: No se pudo convertir el color a HEX.", this.color)

            return "#CCCCCC" // Gris por defecto
        }


        return `#${this.color.map(c => c.toString(16).padStart(2, '0')).join('')}`
    }

    getColorAsRGBA(alpha = 1) {
        if (!this.bgcolor || this.bgcolor.length < 3) {
            console.error("❌ Error: No se pudo convertir el background a RGBA.", this.bgcolor)

            return `rgba(200, 200, 200, ${alpha})` // Gris por defecto
        }


        return `rgba(${this.bgcolor[0]}, ${this.bgcolor[1]}, ${this.bgcolor[2]}, ${alpha})`
    }

    equipWeapon(weapon_name) {
        const weapon = this.weaponDb[weapon_name]
        console.log(`Intentando equipar weapon:`, weapon)

        if (weapon) {
            this.weapon = weapon
            console.log(`✅ Weapon equipada: ${weapon.name}`)

        } else {
            console.log(`❌ No se pudo equipar el arma: ${weapon_name}`)

        }
    }
    
    
    equipShield(shield_name) {
        const shield = this.shieldDb[shield_name]
        console.log(`Intentando equipar shield:`, shield)

        if (shield) {
            this.shield = shield
            console.log(`✅ Shield equipado: ${shield.name}`)

        } else {
            console.log(`❌ No se pudo equipar el escudo: ${shield_name}`)

        }
    }
    
    equipArmor(armor_name) {
        const armor = this.armorDb[armor_name]
        console.log(`Intentando equipar armor:`, armor)

        if (armor) {
            this.armor = armor
            console.log(`✅ Armor equipada: ${armor.name}`)

        } else {
            console.log(`❌ No se pudo equipar la armadura: ${armor_name}`)

        }
    }
    
    equipAccessory(accessory_name) {
        const accessory = this.accessoryDb[accessory_name]
        console.log(`Intentando equipar accessory:`, accessory)
        if (accessory) {
            this.accessory = accessory
            console.log(`✅ Accessory equipado: ${accessory.name}`)

        } else {
            console.log(`❌ No se pudo equipar el accesorio: ${accessory_name}`)

        }
    }
        

    calcStats() {
        console.log(`Calculando stats para: ${this.name}`)

        const base_hp = 40
        this.hp_max = Math.round(base_hp + (this.vit * 1.75) + (this.sou * 1.35) + (this.str * 1.25))
        this.hp = this.hp_max

        const weapon_atk = this.weapon?.atk || 0
        const shield_def = this.shield?.def || 0
        const armor_def = this.armor?.def || 0
        const accessory_def = this.accessory?.def || 0
        
        this.total_atk = Math.round(weapon_atk + (this.str / 2))
        this.total_def = Math.round(shield_def + armor_def + accessory_def + (this.vit / 3))

        const weapon_matk = this.weapon?.matk || 0
        const shield_mdef = this.shield?.mdef || 0
        const armor_mdef = this.armor?.mdef || 0
        const accessory_mdef = this.accessory?.mdef || 0
        
        this.total_matk = Math.round(weapon_matk + (this.wis / 2))
        this.total_mdef = Math.round(shield_mdef + armor_mdef + accessory_mdef + (this.sou / 3))

        this.atk = Math.round((this.str * 0.50) * (this.dex * 0.15) + weapon_atk)
        console.log(`Ataque calculado: ${this.atk}`)

        this.defense = Math.round(armor_def + shield_def + accessory_def + this.vit * 0.1)
        console.log(`Defensa ${this.defense}`)

        this.calcSp()
    }
    
    calcSp() {
        console.log(`Calculando SP para: ${this.name}`)
        if (this.isMagicalJob(this.job)) {
            const base_sp = 30
            this.sp_max = Math.round(base_sp + (this.wis * 0.40) * (this.sou * 0.40))
        } else {
            const base_sp = 20
            this.sp_max = Math.round(base_sp + (this.wis * 0.35) * (this.sou * 0.35))
        }
        console.log(`SP calculado: ${this.sp_max}`)
        this.sp = this.sp_max
    }

    checkStatus() {
        // Si hay algún estado (error, por ejemplo), se marca en rojo de lo contrario, se indica "Bien" en verde.
        if (this.status) {
          return `<span style="color:red; font-weight:bold;">${this.status}</span>`
        }
        return `<span style="color:green; font-weight:bold;">Bien</span>`
    }

    getHudData() {
        const job_data = job_stats[this.job] || {}
        const border_color = job_data.color || 'white'
      
        // Se utiliza checkStatus() para obtener el estado con formato HTML
        const state = this.checkStatus()
      
        const hud_text = (
          `${this.name} | Nivel: ${this.level}  Estado: ${state}\n` +
          `HP: ${this.hp}/${this.hp_max} | SP: ${this.sp}/${this.sp_max} | Fat: ${this.fatigue}/${this.max_fatigue}`
        )
      
        return {
          title: this.job.charAt(0).toUpperCase() + this.job.slice(1),
          border_color: border_color,
          hud_text: hud_text
        }
    }


    checkStats(jobStats) {
        const statsBreakdown = {}
    
        // Para cada job en jobStats, suma todas las estadísticas
        for (const [job, data] of Object.entries(jobStats)) {
            const stats = data?.stats || {}

            // Suma los valores de stats
            const total = Object.values(stats).reduce((acc, val) => acc + val, 0)
            statsBreakdown[job] = total
            
        }
    
        // Construye un string con "job: total"
        let result = ""

        for (const [job, total] of Object.entries(statsBreakdown)) {
            result += `${job}: ${total}\n`
    }
    
    // Muestra el resultado (similar a game_print en Python)
    console.log(result)
    }
      
    isMagicalJob(jobName) {
        const magicalJobs = ['wizard', 'sorcerer', 'cleric']
        return magicalJobs.includes(jobName.toLowerCase())
    }


    getJobStats(jobName) {
        const lower = jobName.toLowerCase()
        const jobData = job_stats[lower] || null
        if (jobData) {
            return jobData.stats
        }
        return null
    }
    

    getWeaponByName(name, weaponDb) {
        return weaponDb ? weaponDb[name] || null : null
    }
    
    getShieldByName(name, shieldDb) {
        return shieldDb ? shieldDb[name] || null : null
    }
    
    getArmorByName(name, armorDb) {
        return armorDb ? armorDb[name] || null : null
    }
    
    getAccessoryByName(name, accessoryDb) {
        return accessoryDb ? accessoryDb[name] || null : null
    }

    
    toString() {
        const weapon_name = (this.weapon && typeof this.weapon === 'object') ? (this.weapon.name || 'None') : 'None'
        const weapon_atk = (this.weapon && typeof this.weapon === 'object') ? (this.weapon.atk || '0') : '0'
        const weapon_matk = (this.weapon && typeof this.weapon === 'object') ? (this.weapon.matk || '0') : '0'

        const shield_name = (this.shield && typeof this.shield === 'object') ? (this.shield.name || 'None') : 'None'
        const shield_def = (this.shield && typeof this.shield === 'object') ? (this.shield.def || '0') : '0'
        const shield_mdef = (this.shield && typeof this.shield === 'object') ? (this.shield.mdef || '0') : '0'

        const armor_name = (this.armor && typeof this.armor === 'object') ? (this.armor.name || 'None') : 'None'
        const armor_def = (this.armor && typeof this.armor === 'object') ? (this.armor.def || '0') : '0'
        const armor_mdef = (this.armor && typeof this.armor === 'object') ? (this.armor.mdef || '0') : '0'

        const accessory_name = (this.accessory && typeof this.accessory === 'object') ? (this.accessory.name || 'None') : 'None'
        const accessory_def = (this.accessory && typeof this.accessory === 'object') ? (this.accessory.def || '0') : '0'
        const accessory_mdef = (this.accessory && typeof this.accessory === 'object') ? (this.accessory.mdef || '0') : '0'

        return (
            `\nJugador: ${this.name} (${this.job.charAt(0).toUpperCase() + this.job.slice(1)})\n\n` +
            `HP:  ${String(this.hp_max).padStart(3)} /${String(this.hp_max).padStart(3)}   SP: ${String(this.sp_max).padStart(5)}\n` +
            `ATK:      ${String(this.total_atk).padStart(3)}   MATK: ${String(this.total_matk).padStart(3)}\n` +
            `DEF:      ${String(this.total_def).padStart(3)}   MDEF: ${String(this.total_mdef).padStart(3)}\n\n` +
            `Estadísticas:\n` +
            `STR:     ${String(this.str).padStart(3)}   VIT: ${String(this.vit).padStart(3)}   AGI: ${String(this.agi).padStart(3)}\n` +
            `DEX:     ${String(this.dex).padStart(3)}   WIS: ${String(this.wis).padStart(3)}   SOU: ${String(this.sou).padStart(3)}\n\n` +
            `Arma:     ${ (weapon_name.charAt(0).toUpperCase() + weapon_name.slice(1)).padStart(15) }   Atk: ${String(weapon_atk).padStart(3)}   Matk: ${String(weapon_matk).padStart(3)}\n` +
            `Escudo:   ${ (shield_name.charAt(0).toUpperCase() + shield_name.slice(1)).padStart(15) }   Def: ${String(shield_def).padStart(3)}   Mdef: ${String(shield_mdef).padStart(3)}\n` +
            `Armadura: ${ (armor_name.charAt(0).toUpperCase() + armor_name.slice(1)).padStart(15) }   Def: ${String(armor_def).padStart(3)}   Mdef: ${String(armor_mdef).padStart(3)}\n` +
            `Accesorio:   ${ (accessory_name.charAt(0).toUpperCase() + accessory_name.slice(1)).padStart(12) }   Def: ${String(accessory_def).padStart(3)}   Mdef: ${String(accessory_mdef).padStart(3)}\n`
        )
    }
}