window.addEventListener("message", async e => {

let playback = e.data.video_config_media.playback;
let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
const streamlist = await getAllOrigins(playback)

console.log(streamlist)

function getAllOrigins(url) {
return fetch(url)
    }
})
