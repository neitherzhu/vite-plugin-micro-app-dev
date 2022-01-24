const axios = require('axios')
const cheerio = require('cheerio')
const URL = require('url')
const pluginName = 'MicroAppDev'

function isCombo (url) {
  return url.indexOf('??') > -1
}

function isExternal (url) {
  const path = url.split('?')[0]
  const lastPath = path.split('/').slice(-1)[0]

  const parts = lastPath.split('.')

  if (parts.length <= 2) return true

  if (['min', 'source'].includes(parts[1])) return true

  return false
}

function getExternalStatics (url) {
  return axios.get(url).then(response => {
    const html = response.data
    const $ = cheerio.load(html)

    // script标签
    const srcs = Array.from($('head > script'))
      .map(s => {
        const src = s.attribs.src
        if (!src) return

        if (isCombo(src) || isExternal(src)) {
          return URL.resolve(url, src)
        }
      })
      .filter(Boolean)

    // link标签
    const links = Array.from($('head > link'))
      .map(l => {
        if (l.attribs.rel !== 'stylesheet') return
        const href = l.attribs.href

        if (!href) return

        if (isCombo(href) || isExternal(href)) {
          return URL.resolve(url, href)
        }
      })
      .filter(Boolean)

    return [srcs, links]
  })
}

export default function MocroAppDev (opts) {
  const { mainAppUrl } = opts

  return {
    name: pluginName,

    async transformIndexHtml (html) {
      const [srcs, links] = await getExternalStatics(mainAppUrl)
      let str = ''

      str += links.map(x => `<link rel="stylesheet" href="${x}"/>`).join('')
      str += `<script>var IS_DEV = true</script>`
      str += srcs.map(x => `<script src="${x}"></script>`).join('')

      return html.replace(/<\/head>/, head => `${str}${head}`)
    }
  }
}
