'use strict'

const {readFile} = require('fs').promises
const fetch = require('node-fetch')

class RegExpMatcher {
	constructor(pattern) {
		this.re = pattern
	}
	match(s) {
		const m = this.re.exec(s)
		if (!m) return null
		if (this.re.global || this.re.sticky) this.re.lastIndex = 0
		return m
	}
	*matchAll(s) {
		if (this.re.global || this.re.sticky) {
			for (;;) {
				const {lastIndex} = this.re
				const m = this.re.exec(s)
				if (!m) return
				yield m
				if (this.re.lastIndex === lastIndex) ++this.re.lastIndex
			}
		} else {
			let lastIndex = 0
			for (;;) {
				const m = this.re.exec(s.slice(lastIndex))
				if (!m) return
				const offset = m.index + m[0].length
				m.index += lastIndex
				yield m
				lastIndex += offset || 1
			}
		}
	}
}

class NaiveElementMatcher extends RegExpMatcher {
	constructor(tagName) {
		super(new RegExp(`<(${tagName})(\s.*?)?>(.*?)</${tagName}>`, 'sg'))
	}
	match(html) {
		const m = super.match(html)
		return m ? createElement(m) : m
	}
	*matchAll(html) {
		for (const m of super.matchAll(html)) {
			yield createElement(m)
		}
	}
}
function createElement(m) {
	return {
		tagName: m[1],
		attributes: m[2],
		innerHTML: m[3],
	}
}

async function compilerOptions() {
	const options = []

	const tr = new NaiveElementMatcher('tr')
	const td = new NaiveElementMatcher('td')
	const code = new NaiveElementMatcher('code')
	const em = new NaiveElementMatcher('em')

	const doc = await fetch('https://www.typescriptlang.org/docs/handbook/compiler-options.html')
	for (const row of tr.matchAll(await doc.text())) {
		const cells = [...td.matchAll(row.innerHTML)]
		if (!cells.length) continue
		const _option = code.match(cells[0].innerHTML)
		if (!_option) throw new Error()
		const option = _option.innerHTML.replace(/^--/, '')
		const _type = code.match(cells[1].innerHTML)
		const cli = !_type
		const type = _type && _type.innerHTML
		const _defaultValue = code.match(cells[2].innerHTML)
		const defaultValue = _defaultValue && _defaultValue.innerHTML
		const description = cells[3].innerHTML
		const deprecated = description.includes('DEPRECATED')
		options.push({
			option,
			type,
			defaultValue,
			description,
			deprecated,
			cli,
		})
	}
	const docb = await fetch('https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html')
	for (const row of tr.matchAll(await docb.text())) {
		const cells = [...td.matchAll(row.innerHTML)]
		if (!cells.length) continue
		const _option = code.match(cells[0].innerHTML)
		if (!_option) continue
		const option = _option && _option.innerHTML.replace(/^--/, '')
		const _notSupported = em.match(cells[1].innerHTML)
		const notSupported = _notSupported && _notSupported.innerHTML === 'Not supported in MSBuild'
		const type = cells[2].innerHTML

		if (notSupported && type.trim() !== '') console.warn(`${option} ${notSupported.innerHTML} "${type}"`)

		const exist = options.find(({option: o}) => option === o)
		if (!exist) {
			options.push({option, type, msbuild: true})
			continue
		}

		if (notSupported) continue
		if (exist.type === 'string' || exist.type === 'string[]') continue
		if (exist.type !== type) console.warn(`${option} type mismatch: ${exist.type} / ${type} (msbuild)`)
	}

	return options
}

async function initOptions() {
	const text = await readFile(`${__dirname}/tsconfig.json`, 'utf8')
	const keys = text.match(/"(.+?)":/g)
	return keys.map(k => k.slice(1, -2))
}

async function baseOptions() {
	const text = await readFile(`${__dirname}/src/tsconfig.yaml`, 'utf8')
	const keys = text.match(/(\S+?):/g)
	return keys.map(k => k.slice(0, -1))
}

void async function main() {

	const doc = (await compilerOptions()).filter(o => !o.deprecated && !o.cli)
	const base = await baseOptions()
	const init = await initOptions()

	const missingOptions = doc.filter(o => !base.includes(o.option))
	const extraOptions = base.filter(o => !doc.find(x => x.option === o))
	console.log('missing:', missingOptions)
	console.log('extra', extraOptions)

}()
