window.addEventListener("message", async e => {



  function pegaString(str, first_character, last_character) {
    if (str.match(first_character + "(.*)" + last_character) == null) {
      return null;
    } else {
      new_str = str.match(first_character + "(.*)" + last_character)[1].trim()
      return new_str;
    }
  }

let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
let preservedState = null;
let href = e.data.href;
let url = await getHTML(href)

console.log(href)
console.log(url)




function getAllOrigins(url) {
    return new Promise(async (resolve, reject) => {
      await $.ajax({
        async: true,
        type: "GET",
        url: allorigins + encodeURIComponent(url),
        responseType: 'json'
      })
      .then(res=>{
        resolve(res.contents ?? res)
      })
      .catch(err=>reject(err));
    })
  }

async function getHTML(url) {
    const html = await getAllOrigins(url)
    return html;
  }

  async function getStream(url) {
    const episodeStream = JSON.parse(await getAllOrigins(url));
    return episodeStream;
  }
});
