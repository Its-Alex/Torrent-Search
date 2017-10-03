const TorrentSkull = require('./torrentSkull.js')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const async = require('async')

class Torrent9 extends TorrentSkull {
  constructor () {
    super()

    this.provider = 'torrent9'
    this.baseUrl = 'http://www.torrent9.pe'
    this.type = 'series'
    this.query = 'supergirl'
    this.page = 0
    this.selector = 'i.fa-desktop,i.fa'
  }

  getMagnets (link) {
    return new Promise((resolve, reject) => {
      fetch(link)
      .then(res => {
        return res.text()
      })
      .then(res => {
        let $ = cheerio.load(res)
        let torrent

        $('a.btn,a.btn-danger,a.download').each((index, elmt) => {
          if (elmt && elmt.attribs && elmt.attribs.href && elmt.attribs.href.search('magnet:') !== -1) {
            torrent = {
              link: link,
              magnet: elmt.attribs.href
            }
            resolve(torrent)
          }
        })
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }

  getTorrents () {
    return new Promise((resolve, reject) => {
      let cat

      if (this.type === 'movies') cat = '/films/'
      if (this.type === 'series') cat = '/series/'
      fetch(`${this.baseUrl + '/search_torrent' + cat + this.query.trim().replace(/ /, '+')}/page-${this.page}`)
      .then(res => {
        return res.text()
      })
      .then(res => {
        let $ = cheerio.load(res)
        var arr = Object.values($(this.selector))
        async.map(arr, (elem, cb) => {
          if ($(elem).next()[0] && $(elem).next()[0].attribs && $(elem).next()[0].attribs.href.match(/^\/torrent\/[A-za-z0-9/\-.]+/)) {
            this.getMagnets(this.baseUrl + $(elem).next()[0].attribs.href).then(res => {
              cb(null, res)
            }).catch(err => cb(err))
          } else {
            return cb(null, undefined)
          }
        }, (err, results) => {
          if (err) return reject(err)
          resolve(results.filter(e => e))
        })
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  }
}

module.exports = Torrent9
