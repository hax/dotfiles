'use strict'

const {readFileSync, writeFileSync} = require('fs')
const {resolve} = require('path')

const srcPath = resolve(__dirname, './src/tsconfig-base.json')
const outPath = resolve(__dirname, './tsconfig-base.json')

const banner = '// See https://github.com/hax/dotfiles/tree/master/src/tsconfig-base.json for full edition\n'
const src = readFileSync(srcPath, 'utf-8')
const content = JSON.parse(removeComments(src))
const out = banner + JSON.stringify(content, null, '\t') + '\n'
// console.log(out)
writeFileSync(outPath, out, 'utf-8')

function removeComments(src) {
	return src.replaceAll(/\/\/.*|\/\*[\s\S]*?\*\//g, "")
}
