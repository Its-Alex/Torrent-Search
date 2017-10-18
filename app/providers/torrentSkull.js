module.exports = class TorrentSkull {
  constructor () {
    // Name of provider
    this.provider = ''

    // Only for provider who has public API
    this.baseUrl = ''

    // Only for provier who needs to be scraped
    this.selector = ''

    // Params of query
    this.limit = ''

    // Type of search
    this.supportImdb = false
    this.supportQuery = false

    // Type of contents searched (movies, series)
    this.type = []

    // Priority of provider
    this.priority = 10

    this.torrents = []
  }
}
