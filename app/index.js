const map = require('async/map')
const sub = require('./providers/providers.js')
const debug = require('debug')('search')

// const config = JSON.parse(require('fs').readFileSync(require('path').resolve(require('path').dirname(__dirname), '.config.json'), 'UTF-8'))

class TorrentSearch {
  constructor () {
    this.activeProviders = ['yts', 'rarbg']
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
      if (elmt === 'rarbg') this.activeProviders.push(elmt)
      if (elmt === 'yts') this.activeProviders.push(elmt)
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
            if (sub[elem].type.indexOf(type) === -1) return cb(null, [])

            if (imdb && sub[elem].supportImdb) {
              sub[elem].getTorrents(this.params)
              .then(res => {
                if (res.length !== 0) {
                  cb(null, {
                    priority: sub[elem].priority,
                    torrents: res
                  })
                } else {
                  cb(null, {})
                }
              })
              .catch(err => {
                console.log(err)
                cb(err, null)
              })
            } else if (name && sub[elem].supportQuery) {
              sub[elem].getTorrents(this.params).then(res => {
                if (res.length !== 0) {
                  cb(null, {
                    priority: sub[elem].priority,
                    torrents: res
                  })
                } else {
                  cb(null, {})
                }
              }).catch(err => {
                console.log(err)
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

    if (this.torrents.length !== 0) {
      if (!Array.isArray(this.torrents) || this.torrents[0].length === 0) return finalArray
    } else {
      return finalArray
    }

    this.torrents
    .sort((first, second) => {
      if (first.priority < second.priority) return -1
      if (first.priority > second.priority) return 1
      if (first.priority === second.priority) return 0
    }).map(elem => {
      if (elem.torrents && elem.torrents.length !== 0) {
        elem.torrents.map(elmt => {
          if (elmt.quality === '1080') elmt.quality = '1080p'
          if (elmt.quality === '720') elmt.quality = '720p'
          if (elmt.quality === '480') elmt.quality = '480p'
          if (elmt.quality === '360') elmt.quality = '360p'
          if (elmt.quality === '240') elmt.quality = '240p'

          if (elmt.quality) finalArray.push(elmt)
        })
      }
    })
    return finalArray
  }

  parseArgs (imdb, name, type, opts) {
    return new Promise((resolve, reject) => {
      if (type !== 'series' && type !== 'movies') return reject(new Error('Bad type!'))
      if (!imdb && !name) return reject(new Error('No query!'))
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

if (debug.enabled) {
  let t = new TorrentSearch()
  t.getTorrents('tt1396484', null, 'movies')
  .then(res => {
    console.log('result:')
    console.log(res)
  })
  .catch(err => {
    console.log(err)
  })

  process.on('unhandledRejection', (reason, p) => {
    console.log('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason)
  })
}

module.exports = TorrentSearch
