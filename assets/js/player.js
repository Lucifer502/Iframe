window.addEventListener("message", async e => {

let playback = e.data.video_config_media.playback;
let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
const streamlist = await getAllOrigins(playback).then(res=>res.json())

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
