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

	const doc = await fetch('https://www.typescriptlang.org/docs/handbook/compiler-options.html')
	const text = await doc.text()
	const tr = new NaiveElementMatcher('tr')
	const td = new NaiveElementMatcher('td')
	const code = new NaiveElementMatcher('code')

	for (const row of tr.matchAll(text)) {
		const cells = [...td.matchAll(row.innerHTML)]
		if (!cells.length) continue
		const option = code.match(cells[0].innerHTML)
		const type = code.match(cells[1].innerHTML)
		const defaultValue = code.match(cells[2].innerHTML)
		const description = cells[3].innerHTML
		const deprecated = description.includes('DEPRECATED')
		if (type && !deprecated) options.push({
			option: option.innerHTML.replace(/^--/, ''),
			type: type.innerHTML,
			defaultValue: defaultValue && defaultValue.innerHTML,
			description,
		})
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

	const doc = await compilerOptions()
	const base = await baseOptions()
	const init = await initOptions()

	const missingOptions = doc.filter(o => !base.includes(o.option))
	const extraOptions = base.filter(o => !doc.find(x => x.option === o))
	console.log('missing:', missingOptions)
	console.log('extra', extraOptions)

}()
