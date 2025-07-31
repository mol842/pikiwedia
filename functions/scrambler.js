
//// ======== old, unused ========

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
function scromble_pairs(text) {
  // simple scrombler, doesnt weally rork
  return text.replace(/\b(\w+)\s+(\w+)\b/g, (match, w1, w2) => {
    if (w1.length > 3 && w2.length > 3 && !(w1 in stopwords) & !(w1 in stopwords) ) {
      return w2[0] + w1.slice(1) + ' ' + w1[0] + w2.slice(1)
    }
    return match
  })
}


//// ======== helper function ========

function get_word_start(word){
    // get chunk up to first vowel
    const match = word.match(/^[^aeiouAEIOU]+/);
    if (match) {
      return match[0]
    }
    return ""
}
function get_word_end(word) {
    // get chunk after first vowel
    const match = word.match(/^[^aeiouAEIOU]+(.*)/);
    if (match) {
      return match[1]
    }
    return ""
}

function startsWithUpperCase(word){
  // does isuppercase seriously not exist?
  // true if it does, false if it doesnt start with a captital
  return word[0] == word[0].toUpperCase();
}

function firstToUpperCase(word, isCap){
  if (isCap){
    word = word.charAt(0).toUpperCase() + word.slice(1);
  } else {
    word = word.charAt(0).toLowerCase() + word.slice(1);
  }
  return word;
}

function swapCapitals(w1, w2){
  let w1_new = firstToUpperCase(w1, startsWithUpperCase(w2));
  let w2_new = firstToUpperCase(w2, startsWithUpperCase(w1));
  return w1_new, w2_new
}

//// ======== end helper functions ========


function spoonerise_pair(w1, w2, w0=" ") {
  // get spaces at start and end of word ugh...
  let w1_start = get_word_start(w1);
  let w2_start = get_word_start(w2);
  w1_start, w2_start = swapCapitals(w1_start, w2_start);

  return (w2_start + get_word_end(w1) + w0 + w1_start + get_word_end(w2));
  // return (get_word_start(w2) + get_word_end(w1) + w0 + get_word_start(w1) + get_word_end(w2));
}

const stopwords =  ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]
const sepwords = ["and", "or", " ", "of"]

function scromble_pairs_new(text){
  // (word) (word or space or and or whatever) (word)
  // this may not work if its greedy
  //const regex = /(\w+)(\s)(\w+)/g
  const regex = /\b((?!\b(?:the|at|is|or|as|any)\b)[^aeiouAEIOU\s]+[a-zA-Z]{2,})((?:\s?(?:\s|at|,|and|or|of|is|a|as|with|-)\s?)+)\b((?:(?!\b(?:the|is|at|or|as|any))\b)[^aeiouAEIOU\s]+[a-zA-Z]{2,})/gi

  // const regex = /\b([^aeiouAEIOU\s]+[a-zA-Z]{2,})(\s?(?:\s|,|and|or|of|-)\s?)\b([^aeiouAEIOU\s]+[a-zA-Z]{2,})/gi
  // const regex = /([^aeiouAEIOU\s][a-zA-Z]{2,})(\s?(?:,|\s|and|or|of|-)\s?)([^aeiouAEIOU\s][a-zA-Z]{2,})/gi
  //const regex = /([^aeiouAEIOU\s]\w{2,})(\s?(?:\s|and|or|of)\s?)([^aeiouAEIOU\s]\w{2,})/g

  return text.replace(regex, (match, w1, sep, w2) => {
    if (stopwords.includes(w1.toLowerCase()) || stopwords.includes(w2.toLowerCase())){
      console.log("EVIL" + w1, sep, w2)
      // return w1 + sep + w2
    }
    return spoonerise_pair(w1, w2, sep);
    
  })
}



const fetch = require('node-fetch')

exports.handler = async function (event) {
  const path = event.path
  const pageTitle = decodeURIComponent(path.split('/').pop())
  const url = `https://en.wikipedia.org/api/rest_v1/page/html/${pageTitle}`
  // const url = `https://en.wikipedia.org/wiki/${pageTitle}`
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
    html = html.replace(/>([^<]+)</g, (match, text) => `>${scromble_pairs_new(text)}<`)
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
          <title>Pikiwedia: ${pageTitle.replaceAll("_", " ")}</title>
          <link rel="icon" type="image/png" href="/public/wiki-8ball.png">

        </head>
        
        <body>
            <div class="mw-body">
            <div class="mw-header">
              <a href="https://pikiwedia.netlify.app/">
                <img src="/public/wiki-8ball.png" alt="Pikiwedia Logo" width="60" height="60">
              </a>
              <a href="https://pikiwedia.netlify.app/">
                <h1>Pikiwedia: the Lee Enfrycopedia</h1>
              </a>
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
