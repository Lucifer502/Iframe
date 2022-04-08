window.addEventListener("message", async e => {
 
let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
let video_config_media = await fetch(e.data.playback).then((response)=>response.json())
console.log(video_config_media);




function getAllOrigins(url) {
    return new Promise(async (resolve, reject) => {
      await $.ajax({
        async: true,
        type: "GET",
        url: needproxy ? allorigins + encodeURIComponent(url) : url,
        responseType: 'json'
      })
      .then(res=>{
        resolve(res.contents ?? res)
      })
      .catch(err=>reject(err));
    })
  }



});
