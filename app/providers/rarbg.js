const TorrentSkull = require('./torrentSkull.js')
const each = require('async/each')

const https = require('https')
const moment = require('moment')
const { stringify } = require('querystring')

class RarbgApi {
  constructor () {
    this.config = {
      host: 'torrentapi.org',
      path: '/pubapi_v2.php?'
    }
    this.categories = {
      XXX: 4,
      MOVIES_XVID: 14,
      MOVIES_XVID_720: 48,
      MOVIES_X264: 17,
      MOVIES_X264_1080: 44,
      MOVIES_X264_720: 45,
      MOVIES_X264_3D: 47,
      MOVIES_FULL_BD: 42,
      MOVIES_BD_REMUX: 46,
      TV_EPISODES: 18,
      TV_HD_EPISODES: 41,
      MUSIC_MP3: 23,
      MUSIC_FLAC: 25,
      GAMES_PC_ISO: 27,
      GAMES_PC_RIP: 28,
      GAMES_PS3: 40,
      GAMES_XBOX_360: 32,
      SOFTWARE_PC_ISO: 33,
      E_BOOKS: 35
    }
    this.lastRequestTime = moment()
    this.tokenTimestamp = moment('1970-01-01', 'YYYY-MM-DD')
  }

  validateParams (query) {
    return new Promise((resolve, reject) => {
      if (!query.mode) {
        return reject(new Error('Invalid query object -- no search mode'))
      } else if (query.mode === 'search') {
        if (
          !query.search_string &&
          !query.search_themoviedb &&
          !query.search_tvdb &&
          !query.search_imdb
        ) {
          const err = new Error('Invalid query object -- no search parameters')
          return reject(err)
        }
      } else if (query.mode !== 'list') {
        return reject(new Error('Invalid query object -- search mode invalid'))
      }

      resolve()
    })
  }

  setToken () {
    return this.sendRequest({
      get_token: 'get_token'
    }).then(res => {
      this._token = res.token
      this.tokenTimestamp = moment()
    })
  }

  getToken () {
    if (
      (!this._token && !this._setting_token) ||
      (moment().diff(this.tokenTimestamp, 'minutes') > 14)
    ) {
      return this.setToken()
    }

    return Promise.resolve()
  }

  search (query) {
    query.mode = 'search'
    return this.apiRequest(query)
  }

  list (query = {}) {
    query.mode = 'list'
    return this.apiRequest(query)
  }

  apiRequest (query) {
    return new Promise((resolve, reject) => {
      return Promise.all([
        this.validateParams(query),
        this.getToken()
      ]).then(() => {
        // There's a 1 request/2 second rate limit
        const delay = 2000 - moment().diff(this.lastRequestTime)
        query.token = this._token

        return setTimeout(() => {
          return this.sendRequest(query).then(({ torrent_results }) => {
            if (!torrent_results) { // eslint-disable-line camelcase
              return resolve(new Error('No results found!'))
            }

            return resolve(torrent_results)
          }).catch(err => reject(err))
        }, delay)
      }).catch(err => reject(err))
    })
  }

  sendRequest (query) {
    return new Promise((resolve, reject) => {
      const req = {
        host: this.config.host,
        path: this.config.path + stringify(query)
      }

      https.get(req, res => {
        this.lastRequestTime = moment()
        let body = ''

        res.setEncoding('utf8')
        res.on('data', d => {
          body += d
        })
        res.on('end', () => resolve(JSON.parse(body)))
      }).on('error', err => reject(err))
    })
  }
}

const rarbg = new RarbgApi()

class Rarbg extends TorrentSkull {
  constructor (props) {
    super(props)

    this.provider = 'rarbg'

    this.priority = 2

    this.type = ['movies', 'series']

    this.supportImdb = true
    this.supportQuery = true
  }

  getTorrents (params) {
    return new Promise((resolve, reject) => {
      let conf = {
        search_imdb: params.imdbId,
        search_string: !params.imdbId ? params.query : '',
        category: (params.type === 'movies') ? 'movies' : (params.type === 'series') ? 'tv' : 'movies',
        min_seeders: 30,
        sort: 'last'
      }
      if (!params.imdbId) delete conf.search_imdb
      rarbg.search(conf).then(res => {
        if (res.length === 0) return resolve([])

        let torrents = []

        each(res, (elmt, callback) => {
          let obj = {
            magnet: elmt.download,
            quality: (elmt.category) ? elmt.category.split('/')[2] : null
          }
          torrents.push(obj)
          callback()
        }, err => {
          if (err) console.log(err)
          resolve(torrents)
        })
      }).catch(err => {
        if (err) console.log(err)
        resolve([])
      })
    })
  }
}

module.exports = Rarbg
