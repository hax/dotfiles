'use strict'

const {readFileSync, writeFileSync} = require('fs')
const {resolve} = require('path')

const srcPath = resolve(__dirname, './src/.editorconfig')
const outPath = resolve(__dirname, './.editorconfig')

const banner = '# See https://github.com/hax/dotfiles/tree/master/src/.editorconfig for commented edition\n'
const src = readFileSync(srcPath, 'utf-8')
const out = banner + compress(src)
// console.log(out)
writeFileSync(outPath, out, 'utf-8')

function compress(content) {
	return content
		.split(/\n/)
		.map(l => l.trim())
		.filter(l => l.length > 0 && !isComment(l))
		.reduce(({lines, head}, l) => {
			if (isHead(l)) return {lines, head: l}
			if (head) lines.push(head)
			lines.push(l)
			return {lines}
		}, {lines: []})
		.lines.join('\n')
}

function isComment(line) {
	const c = line[0]
	return c === '#' || c === ';'
}
function isHead(line) {
	const c0 = line[0]
	const c1 = line[line.length - 1]
	return c0 === '[' && c1 === ']'
}
