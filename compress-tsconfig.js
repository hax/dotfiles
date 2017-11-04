'use strict'

const {safeLoad} = require('js-yaml')
const {readFileSync, writeFileSync} = require('fs')
const {resolve} = require('path')

const srcPath = resolve(__dirname, './src/tsconfig.yaml')
const outPath = resolve(__dirname, './base.tsconfig.json')

const banner = '// See https://github.com/hax/dotfiles/tree/master/src/tsconfig.yaml for full edition\n'
const src = readFileSync(srcPath, 'utf-8')
const content = safeLoad(src)
const out = banner + JSON.stringify(content, null, '\t')
// console.log(out)
writeFileSync(outPath, out, 'utf-8')
