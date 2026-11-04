import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'

// Capture the real module class without starting Companion's IPC entrypoint.
const source = (await readFile(new URL('../livepremier.js', import.meta.url), 'utf8'))
	.replace("'@companion-module/base'", JSON.stringify(import.meta.resolve('@companion-module/base')))
	.replace("'got'", JSON.stringify(import.meta.resolve('got')))
	.replace('runEntrypoint(LivePremierREST, [])', 'export default LivePremierREST')
const { default: LivePremierREST } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

function instance() {
	const module = Object.create(LivePremierREST.prototype)
	module.updateStatus = (...args) => { module.status = args }
	module.log = () => {}
	module.setActionDefinitions = (actions) => { module.actions = actions }
	module.setPresetDefinitions = (presets) => { module.presets = presets }
	return module
}

test('recall action sends the expected HTTP POST and JSON to the configured device', async () => {
	let receive
	const received = new Promise((resolve) => { receive = resolve })
	const server = createServer(async (request, response) => {
		let body = ''
		for await (const chunk of request) body += chunk
		receive({ method: request.method, path: request.url, body: JSON.parse(body) })
		response.end('{}')
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	try {
		const module = instance()
		await module.init({ host: `127.0.0.1:${server.address().port}` })
		const actionId = '/api/tpp/v1/screens/{screenId}/load-memory'
		await module.actions[actionId].callback({ actionId, options: { screenId: 3, memoryId: 12, target: 'preview' } })
		assert.deepEqual(await received, { method: 'POST', path: '/api/tpp/v1/screens/3/load-memory', body: { memoryId: 12, target: 'preview' } })
		assert.equal(module.presets.length, 44)
		await module.configUpdated({ host: '127.0.0.1:1' })
		await module.sendcmd('/api/tpp/v1/take', {})
		assert.equal(module.status[0], 'unknown_error')
	} finally {
		await new Promise((resolve) => server.close(resolve))
	}
})

test('audio routing and multi-take preserve stable payloads', async () => {
	const module = instance()
	await module.init({ host: '127.0.0.1' })
	const commands = []
	module.sendcmd = (path, body) => { commands.push({ path, body }) }
	await module.actioncb({ actionId: 'multitake', options: { s1: true, s24: true, a2: true, s2: false } })
	assert.deepEqual(commands.shift(), { path: '/api/tpp/v1/take', body: { screenIds: [1, 24], auxiliaryScreenIds: [2] } })
	await module.actions.audioroute.callback({ actionId: 'audioroute', options: { out: 'dante/channels/1', in: ['"sourceType":"dante","channelId":3', '"sourceType":"none"'] } })
	assert.deepEqual(commands, [
		{ path: '/api/tpp/v1/audio/transmitters/dante/channels/1/source', body: { sourceType: 'dante', channelId: 3 } },
		{ path: '/api/tpp/v1/audio/transmitters/dante/channels/2/source', body: { sourceType: 'none' } },
	])
	module.config.host = ''
	await module.actioncb({ actionId: '/api/tpp/v1/take', options: {} })
	assert.equal(commands.length, 2)
})
