
// word scrombler
// stole this from stack overflow thx
function scramble(text) {
  return text
    .split(/\b/)
    .map(word => {
      if (/^\w+$/.test(word)) {
        if (word.length > 3) {
          return word[0] + word.slice(1, -1).split('').sort(() => Math.random() - 0.5).join('') + word[word.length - 1]
        }
      }
      return word
    })
    .join('')
}

const stopwords = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]

function scromble_pairs(text) {
  return text.replace(/\b(\w+)\s+(\w+)\b/g, (match, w1, w2) => {
    if (w1.length > 3 && w2.length > 3 && !(w1 in stopwords) & !(w1 in stopwords) ) {
      return w2[0] + w1.slice(1) + ' ' + w1[0] + w2.slice(1)
    }
    return match
  })
}


const fetch = require('node-fetch')

exports.handler = async function (event) {
  const path = event.path
  const page = decodeURIComponent(path.split('/').pop())
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${page}`
  // const url = `https://en.wikipedia.org/wiki/${page}`
  try {
    const response = await fetch(url)

    let html = "<div>Sorry, page not found. does the actual wiki page exist?</div>"
    if (response.ok){
      html = await response.text()
    } 
    //if (!response.ok) throw new Error('Page not found')

    // let html = await response.text()
    // Remove table of contents (elements with id or class containing "toc")
    // html = html.replace(/<[^>]*(id|class)\s*=\s*["'][^"'>]*toc[^"'>]*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    // html = html.replace(/<[^>]*(id|class)\s*=\s*["'][^"'>]*main-menu[^"'>]*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    // html = html.replace(/<[^>]*(id|class)\s*=\s*["'][^"'>]*vector-header-container[^"'>]*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')

    // scromble all the text!!!!!!! 
    // everything between > tags <
    html = html.replace(/>([^<]+)</g, (match, text) => `>${scromble_pairs(text)}<`)
    // get rid of wiki links
    // html = html.replace(/href="\/wiki\/([^"]+)"/g, 'href="pikiwedia.netlify.app/$1"')

    // so the links work
    html = html.replace(/\.\//g, (match, text) => `https://pikiwedia.netlify.app/`)

      // <link rel="stylesheet" href="https://en.wikipedia.org/w/load.php?modules=site.styles&only=styles">
      // <link rel="stylesheet" href="https://en.wikipedia.org/w/load.php?modules=skins.vector.styles.legacy&only=styles">
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            h1 {
              border-bottom: 1px solid #a2a9b1;
              padding-bottom: .3em;
            }  
            body {
              background-color: #f8f9fa;
              font-family: 'Linux Libertine', 'Georgia', 'Times', serif;
              padding-left: 10%;
              padding-right: 10%;
            }
            .mw-body {
              max-width: 960px;
              margin: 2rem auto;
              background: white;
              padding: 2rem;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            .mw-header {
              display: flex;
              align-items: center;
              margin-bottom: 2rem;
            }
            .mw-header img {
              height: 60px;
              margin-right: 1rem;
            }
            h1 {
              border-bottom: 1px solid #a2a9b1;
              padding-bottom: .3em;
              margin-top: 0;
            }

          </style>
          <meta charset="utf-8">
          <title>${page}</title>
        </head>
        <body>
            <div class="mw-body">
            <div class="mw-header">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png">
              <h1>Pikiwedia: the Lee Enfrycopedia</h1>
            </div>
            ${html}
        </body>
      </html>
    `,
    }
  } catch (err) {
        return {
      statusCode: 500,
      body: 'Something bad happened. does the wiki page exist?',
    }
  }
}
