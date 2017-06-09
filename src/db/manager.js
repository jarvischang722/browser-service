const fs = require('fs')
const path = require('path')

class DbManager {
    constructor(data) {
        this.connections = data.connections
        this.version = data.version || -1
    }

    async getCurrentVersion() {
        this.version = -1
        const queryCheck = `
            SELECT 1
            FROM information_schema.tables
            WHERE
                table_schema = ? 
                AND table_name = ?
            LIMIT 1
        ;`
        const resultCheck = await db.query(queryCheck, [this.connections.database, 'version'])
        if (!resultCheck || resultCheck.length === 0) {
            return this.version
        }
        const queryGetVersion = 'SELECT ver FROM version ORDER BY ver DESC LIMIT 1;'
        const resultVersion = await db.query(queryGetVersion)
        if (!resultVersion || resultVersion.length === 0) {
            return this.version
        }
        this.version = resultVersion[0].ver
        return this.version
    }

    async getPatches() {
        const patchMainPath = path.join(__dirname, 'patches')
        const currentVer = await this.getCurrentVersion()
        const clusters = fs.readdirSync(patchMainPath)
        const patches = []
        for (const c of clusters) {
            if (c.charAt(0) === '.') continue
            const ver = Number.parseFloat(c.slice(0, -4))
            if (ver > currentVer) {
                patches.push({
                    version: ver,
                    file: path.join(patchMainPath, c),
                })
            }
        }
        patches.sort((a, b) => {
            return a.version - b.version
        })
        return patches
    }

    async updateVersion(client, patchVer) {
        const currentVer = await this.getCurrentVersion()
        if (patchVer <= currentVer) return
        const query = 'INSERT INTO version (ver) VALUES (?);'
        await client.query(query, [patchVer])
        this.version = patchVer
    }

    async update() {
        this.version = await this.getCurrentVersion()
        const patches = await this.getPatches()
        await db.transaction(async (client) => {
            for (const patch of patches) {
                const { version, file } = patch
                if (version <= this.version) continue
                const query = fs.readFileSync(file, 'utf8')
                await client.query(query)
                await this.updateVersion(client, version)
            }
        })
    }
}

module.exports = DbManager
