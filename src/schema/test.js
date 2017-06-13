const testTrans = async () => {
    const a = await db.transaction(async (client) => {
        await client.query('SELECT 1;')
        await client.query('SELECT 2;')
    })
    return a
}

module.exports = {
    testTrans,
}
