window.addEventListener("message", async e => {
 
const promises = [], request = [];
 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
  let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
let thumbnail= e.data.thumbnail;
let video_config_media = await getConfigMedia(e.data.playback);
let season_episodes = e.data.season_episodes;
let video_mp4_array = []
let streams = [];
let media = [];
let sources = []
console.log(video_config_media,thumbnail);
console.log(season_episodes)

let dlSize = [];
 let dlUrl = [];
 for (let idx in r) {
  dlSize[idx] = document.getElementById(r[idx] + "_down_size");
  dlUrl[idx] = document.getElementById(r[idx] + "_down_url");
 };

const getStreams = async ()=>{
const streamlist =await mp4ListFromStream(video_config_media['streams']['adaptive_hls']['es-LA']['url'])
return streamlist
}

video_mp4_array = await getStreams()

function downloadStreams(id, intentos = 0) {
  let video_mp4_url = video_mp4_array[id];

  let fileSize = "";
  let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
  http.onreadystatechange = () => {
   if (http.readyState == 4 && http.status == 200) {
    fileSize = http.getResponseHeader('content-length');
    if (!fileSize)
     return setTimeout(() => downloadStreams(id), 5000);
    else {
     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (fileSize == 0) return console.log('addSource#fileSize == 0');
     let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
     if (i == 0) return console.log('addSource#i == 0');
     let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
     dlSize[id].innerText = return_fileSize;
     return console.log(`[CR Premium] Source adicionado: ${r[id]} (${return_fileSize})`);
    }
   } else if (http.readyState == 4 && intentos < 3)
    return setTimeout(() => downloadStreams(id, intentos++), 5000);
  }
  http.open("HEAD", video_mp4_url, true);
  http.send(null);
 };

for (let idx of [1, 0, 2, 3, 4])
  sources.push({ file: video_mp4_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });
 startPlayer();

 function startPlayer() {
  let playerInstance = jwplayer('player_div')
  playerInstance.setup({
   'playlist': [{
    'image': thumbnail,
    'sources': sources,
  }]
  })

  let download_iconPath = "assets/icon/download_icon.svg";
  let download_id = "download-video-button";
  let download_tooltipText = "Download";

  const openModal = document.querySelectorAll(".modal-container")[0];
  const modal = document.querySelectorAll(".modal")[0];
  const closeModal = document.querySelectorAll(".close")[0];

function download_Button() {
   openModal.style.opacity = "1";
   openModal.style.visibility = "visible";
  };

  closeModal.addEventListener("click", function(e) {
   openModal.style.opacity = "0";
   openModal.style.visibility = "hidden"
  });

  playerInstance.addButton(download_iconPath, download_tooltipText, download_Button, download_id);

  for (let id of [1, 0, 2, 3, 4]) {
   dlUrl[id].href = video_mp4_array[id];
   downloadStreams(id);
  };

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
      .then(res=>{
        resolve(res.contents ?? res)
      })
      .catch(err=>reject(err));
    })
  }

async function getConfigMedia(url) {
  let config_media = await getAllOrigins(url)
  return JSON.parse(config_media);
 }

function mp4ListFromStream(url) {
    const cleanUrl = url.replace('evs1', 'evs').replace(url.split("/")[2], "fy.v.vrv.co");
    const res = [];
    for (let i in r)
      if (streamrgx_three.test(cleanUrl) && i <= 2) // por algum motivo alguns videos da CR tem apenas 3 resoluções
        res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
      else
        res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
    return res;
  }


for(let i in season_episodes['items']){
streams.push(season_episodes['items'][i]['playback'])
}

console.log(streams)

getStreamsEpisodes()

async function getStreamsEpisodes(){
for(let i in streams){
 media.push(await getAllOrigins(streams[i]))
}
}


console.log(media)

function ListFromStream(url) {
    const cleanUrl = url.replace('evs3', 'evs').replace(url.split("/")[2], "fy.v.vrv.co");
    const res = [];
    for (let i in r)
      if (streamrgx_three.test(cleanUrl) && i <= 2) // por algum motivo alguns videos da CR tem apenas 3 resoluções
        res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
      else
        res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
    return res;
  }

});
