window.addEventListener("message", async e => {

 const promises = [],
  request = [];
 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let video_mp4_array = [];
 let sources = [];
 let video_config_media = e.data.metadata;
 console.log(video_config_media);
 let user_lang = 'es-LA';

 

 

 for (let idx of [1, 0, 2, 3, 4]) sources.push({ file: video_mp4_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });
 startPlayer();

 function startPlayer() {

  let playerInstance = jwplayer('player_div')
  playerInstance.setup({
   'playlist': [{
    'sources': sources,
  }]
  })

  jwplayer().on('ready', e => {

   document.body.querySelector(".loading_container").style.display = "none";
  });
 }

 

 function getAllOrigins(url) {
  return new Promise(async (resolve, reject) => {
   await $.ajax({
     async: true,
     type: "GET",
     url: allorigins + encodeURIComponent(url),
     responseType: 'json'
    })
    .then(res => {
     resolve(res.contents)
    })
    .catch(err => reject(err));
  })
 }

 async function getStreams(url) {
  const metadata = JSON.parse(await getAllOrigins(url));
  return metadata;
 }
})
