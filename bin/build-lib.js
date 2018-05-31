const babel = require('babel-core')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const mkdirp = promisify(require('mkdirp'))
const eachSeries = require('p-each-series')
const fs = require('fs')
const path = require('path')

const transformFile = promisify(babel.transformFile)
const writeFile = promisify(fs.writeFile)

const SOURCE = 'packages/*/src/**/*.js'

glob(SOURCE).then((files) => {
  return eachSeries(files, (file) => {
    const libFile = file.replace('/src/', '/lib/')
    return transformFile(file, {})
      .then(({ code, map }) => {
        return mkdirp(path.dirname(libFile)).then(() => Promise.all([
          writeFile(libFile, code),
          writeFile(libFile + '.map', JSON.stringify(map))
        ]))
      }).then(() => {
        console.log(libFile)
      })
  })
}).catch((err) => {
  console.error(err.stack)
  process.exit(1)
})
