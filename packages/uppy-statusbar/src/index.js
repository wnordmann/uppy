const Plugin = require('@uppy/core/lib/Plugin')

module.exports = class Stub extends Plugin {
  constructor (uppy, opts) {
    super(uppy, opts)

    this.id = opts.id || 'StatusBarStub'
    this.type = 'stub'
  }
}
