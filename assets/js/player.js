window.addEventListener("message", async e => {

let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let playbacks = e.data.playbacks;
console.log(playbacks);

let video_config_media  = await getStreams(playbacks)

console.log(video_config_media.items.length)
console.log(video_config_media);


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

async function getStreams(url) {
const streams = JSON.parse(await getAllOrigins(url));
return streams
}


});
