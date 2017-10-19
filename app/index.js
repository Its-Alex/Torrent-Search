const map = require('async/map')
const sub = require('./providers/providers.js')

// const config = JSON.parse(require('fs').readFileSync(require('path').resolve(require('path').dirname(__dirname), '.config.json'), 'UTF-8'))

class TorrentSearch {
  constructor () {
    this.activeProviders = ['rarbg', 'yts']
    this.torrents = []
    this.params = {
      imdbId: null,
      query: null,
      type: null,
      limit: 5,
      page: 0,
      lang: 'en-US'
    }
  }

  setActiveProviders (providers) {
    providers.forEach(elmt => {
      if (elmt === 'torrent9') this.activeProviders.push(elmt)
      // if (elmt === 'eztv') this.activeProviders.push(elmt)
      if (elmt === 'rarbg') this.activeProviders.push(elmt)
      if (elmt === 'yts') this.activeProviders.push(elmt)
      // if (elmt === '1337x') this.activeProviders.push(elmt)
    })
  }

  getActiveProviders () {
    return this.activeProviders
  }

  getTorrents (imdb = this.params.imdb, name = this.params.query, type = this.params.type, opts = null) {
    return new Promise((resolve, reject) => {
      this.parseArgs(imdb, name, type, opts).then(res => {
        map(this.activeProviders, (elem, cb) => {
          if (sub[elem]) {
            // Cancel search if provider is not set for this query
            if (sub[elem].type.indexOf(type) === -1) cb(null, [])

            if (imdb && sub[elem].supportImdb) {
              sub[elem].getTorrents(this.params).then(res => {
                if (res.length !== 0) {
                  cb(null, {
                    priority: sub[elem].priority,
                    torrents: res
                  })
                } else cb(null, [])
              }).catch(err => {
                cb(err, null)
              })
            } else if (name && sub[elem].supportQuery) {
              if (sub[elem].type.indexOf(type) === -1) return cb(null, [])
              sub[elem].getTorrents(this.params).then(res => {
                if (res.length !== 0) {
                  cb(null, {
                    priority: sub[elem].priority,
                    torrents: res
                  })
                } else cb(null, [])
              }).catch(err => {
                cb(err, null)
              })
            }
          }
        }, (err, results) => {
          this.torrents = []

          if (err) reject(err)
          results.filter(p => p).forEach(elmt => {
            this.torrents.push(elmt)
          })
          resolve(this.sortTorrents())
        })
      }).catch(err => reject(err))
    })
  }

  sortTorrents () {
    let finalArray = []
    this.torrents.sort((first, second) => {
      if (first.priority < second.priority) return -1
      if (first.priority > second.priority) return 1
      if (first.priority === second.priority) return 0
    }).map((elmt, index) => {
      elmt.torrents.map(elmtChild => {
        if (elmtChild.quality && elmtChild.magnet) finalArray = finalArray.concat(elmtChild)
      })
    })
    return finalArray
  }

  parseArgs (imdb, name, type, opts) {
    return new Promise((resolve, reject) => {
      if (type !== 'series' && type !== 'movies') return reject(new Error('Bad type!'))
      this.params.type = type
      this.params.imdbId = imdb
      this.params.query = name
      if (opts) {
        if (opts.limit) this.params.limit = opts.limit
        if (opts.page) this.params.page = opts.page
        if (typeof opts.lang === 'string') this.params.lang = opts.lang
      }
      resolve()
    })
  }
}

module.exports = TorrentSearch
