window.addEventListener("message", async e => {


let allorigins = "https://api.allorigins.win/get?url="

let playback = e.data.playback

const streamlist = getAllOrigins(playback)

console.log(streamlist)

function getAllOrigins(url) {
    return new Promise(async (resolve, reject) => {
      await $.ajax({
          async: true,
          type: "GET",
          url: allorigins + encodeURIComponent(url),
          responseType: 'json'
        })
        .then(res => {
          resolve(res.contents ?? res)
        })
        .catch(err => reject(err));
    })
  }
})
