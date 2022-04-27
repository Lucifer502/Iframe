window.addEventListener("message", async e => {

 const promises = [],
  request = [];
 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };
 for (let i in r) promises[i] = new Promise((resolve, reject) => request[i] = { resolve, reject });

 let rgx = /http.*$/gm;
 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let video_config_media = JSON.parse(e.data.video_config_media);
 let video_id = video_config_media['metadata']['id'];
 let up_next_cooldown = e.data.up_next_cooldown;
 let up_next_enable = e.data.up_next_enable;
 let up_next = e.data.up_next;
 let version = e.data.version;
 let user_lang = e.data.lang;
 let series = e.data.series;
 let episode_translate = "";
 let video_stream_url = "";
 let video_m3u8_array = [];
 let video_mp4_array = [];
 let final_translate = "";
 let episode_title = "";
 let rows_number = 0;
 let sources = [];

 let dlSize = [];
 let dlUrl = [];
 for (let idx in r) {
  dlSize[idx] = document.getElementById(r[idx] + "_down_size");
  dlUrl[idx] = document.getElementById(r[idx] + "_down_url");
 }

 const streamlist = video_config_media['streams'];
 for (let stream of streamlist) {
  if (stream.format == 'trailer_hls' && stream.hardsub_lang == user_lang || (streamlist.length < 15 && stream.hardsub_lang === null))
   if (rows_number <= 4) {
    const arr_idx = (rows_number === 0 ? 2 : (rows_number === 2 ? 0 : rows_number));
    video_mp4_array[arr_idx] = getDirectFile(stream.url);
    rows_number++;
    if (rows_number > 4) {
     video_m3u8_array = video_mp4_array;
     for (let i in r) {
      const idx = i;
      setTimeout(() => request[idx].resolve(), 400);
     }
     break;
    }
   }
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang) {
   video_stream_url = stream.url;
   video_m3u8_array = await m3u8ListFromStream(video_stream_url);
   video_mp4_array = mp4ListFromStream(video_stream_url);
   break;
  }
 }

 const epLangs = { "ptBR": "Episódio", "enUS": "Episode", "enGB": "Episode", "esLA": "Episodio", "esES": "Episodio", "ptPT": "Episódio", "frFR": "Épisode", "deDE": "Folge", "arME": "الحلقة", "itIT": "Episodio", "ruRU": "Серия" };
 const fnLangs = { "ptBR": "FINAL", "enUS": "FINAL", "enGB": "FINAL", "esLA": "FINAL", "esES": "FINAL", "ptPT": "FINAL", "frFR": "FINALE", "deDE": "FINALE", "arME": "نهائي", "itIT": "FINALE", "ruRU": "ФИНАЛЬНЫЙ" };
 episode_translate = `${epLangs[user_lang[0]] ? epLangs[user_lang[0]] : "Episode"} `;
 final_translate = ` (${fnLangs[user_lang[0]] ? fnLangs[user_lang[0]] : "FINAL"})`;

 if (series) {
  episode_title = series + ' - ' + episode_translate + video_config_media['metadata']['display_episode_number'];
 } else if (video_config_media['metadata']['up_next']) {
  let prox_ep_number = video_config_media['metadata']['up_next']['display_episode_number'];
  episode_title = video_config_media['metadata']['up_next']['series_title'] + ' - ' + prox_ep_number.replace(/\d+|OVA/g, '') + video_config_media['metadata']['display_episode_number'];
 } else
  episode_title = episode_translate + video_config_media['metadata']['display_episode_number'] + final_translate;

 function download(id, intentos = 0) {
  let video_mp4_url = video_mp4_array[id];

  let fileSize = "";
  let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
  http.onreadystatechange = () => {
   if (http.readyState == 4 && http.status == 200) {
    fileSize = http.getResponseHeader('content-length');
    if (!fileSize)
     return setTimeout(() => download(id), 5000);
    else {
     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (fileSize == 0) return console.log('addSource#fileSize == 0');
     let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
     let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
     dlSize[id].innerText = return_fileSize;
    }
   } else if (http.readyState == 4 && intentos < 3)
    return setTimeout(() => download(id, intentos + 1), 5000);
  }
  http.open("HEAD", video_mp4_url, true);
  http.send(null);
 }

 Promise.all(promises).then(() => {
  for (let idx of [0, 1, 2, 3, 4])
   sources.push({ file: video_m3u8_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });
  startPlayer();
 });

 const thumbs = up_next ? video_config_media['metadata']['up_next']['thumbnails'] : [];

 function startPlayer() {
  let playerInstance = jwplayer("player_div")
  playerInstance.setup({
   "playlist": [
    {
     "title": episode_title,
     "description": video_config_media['metadata']['title'],
     "image": video_config_media['thumbnail']['url'],
     "sources": sources,
        },
        up_next_enable && up_next ? {
     "autoplaytimer": 0,
     "title": video_config_media['metadata']['up_next']['display_episode_number'] + ' - ' + video_config_media['metadata']['up_next']['series_title'],
     "file": "https://i.imgur.com/8wEeX0R.mp4",
     "repeat": true,
     "image": thumbs[thumbs.length - 1].url
        } : {}
      ],
   "related": { displayMode: 'none' },
   "nextupoffset": -up_next_cooldown,
   "width": "100%",
   "height": "100%",
   "autostart": false,
   "displayPlaybackLabel": true,
   "primary": "html5",
   "cast": {},
   "playbackRateControls": [0.5, 0.75, 1, 1.25, 1.5, 2]
  }).on('playlistItem', e => {
   if (e.index > 0 && up_next_enable && up_next) {
    jwplayer().setControls(false);
    jwplayer().setConfig({
     repeat: true
    });
    jwplayer().play();
    localStorage.setItem("next_up", true);
    localStorage.setItem("next_up_fullscreen", jwplayer().getFullscreen());
    window.top.location.href = up_next;
   }
  })

  let download_iconPath = "assets/icon/download_icon.svg";
  let download_id = "download-video-button";
  let download_tooltipText = "Download";

  const abrir = document.querySelectorAll(".modal-container")[0];
  const modal = document.querySelectorAll(".modal")[0];
  const cerrar = document.querySelectorAll(".close")[0];

  function download_ButtonClickAction() {
   if (jwplayer().getEnvironment().OS.mobile == true) {
    modal.style.height = "172px";
    modal.style.overflow = "auto";
   }
   abrir.style.visibility = "visible"
  }
  playerInstance
   .addButton(download_iconPath, download_tooltipText, download_ButtonClickAction, download_id);

  for (let id of [0, 1, 2, 3, 4]) {
   download(id);
   dlUrl[id].href = video_mp4_array[id];
   dlUrl[id].download = video_config_media['metadata']['title'];
  }

  jwplayer().on('ready', e => {
   if (localStorage.getItem(video_id) != null) {
    const t = localStorage.getItem(video_id);
    document.getElementsByTagName("video")[0].currentTime = t >= 5 ? t - 5 : t;
   }
   if (localStorage.getItem("next_up") === "true") {
    localStorage.setItem("next_up", false)
    jwplayer().play();
   }
   document.body.querySelector(".loading_container").style.display = "none";
  });

  jwplayer().on('error', e => {
   console.log(e)
   codes = { 232011: "https://i.imgur.com/OufoM33.mp4" };
   if (codes[e.code]) {
    jwplayer().load({
     file: codes[e.code]
    });
    jwplayer().setControls(false);
    jwplayer().setConfig({ repeat: true });
    jwplayer().play();
   }
  });

  setInterval(() => {
   if (jwplayer().getState() == "playing")
    localStorage.setItem(video_id, jwplayer().getPosition());
  }, 7000);
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
     resolve(res.contents ?? res)
    })
    .catch(err => reject(err));
  })
 }

 function getDirectFile(url) {
  return url.replace(/\/clipFrom.*?index.m3u8/, '').replace('_,', '_').replace(url.split("/")[2], "fy.v.vrv.co");
 }

 function mp4ListFromStream(url) {
  const cleanUrl = url.replace('evs1', 'evs').replace(url.split("/")[2], "fy.v.vrv.co");
  const res = [];
  for (let i in r)
   if (streamrgx_three.test(cleanUrl) && i <= 2)
    res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
  else
   res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
  return res;
 }

 async function m3u8ListFromStream(url) {
  let m3u8list = []
  const master_m3u8 = await getAllOrigins(url);

  if (master_m3u8) {
   streams = master_m3u8.match(rgx)
   m3u8list = streams.filter((el, idx) => idx % 2 === 0)
  } else {
   for (let i in r) {
    const idx = i;
    setTimeout(() => request[idx].reject('Manifest m3u8ListFromStream#master_m3u8.length === 0'), 400);
   }
   return [];
  }
  const res = [];
  for (let i in m3u8list) {
   const video_m3u8 = await getAllOrigins(m3u8list[i]);
   m3u8list[i] = blobStream(video_m3u8);
  }

  res.push(buildM3u8(m3u8list));
  for (let i in r) {
   const idx = i;
   setTimeout(() => request[idx].resolve(), 400);
  }
  return res;
 }

 function blobStream(stream) {
  const blob = new Blob([stream], {
   type: "text/plain; charset=utf-8"
  });
  return URL.createObjectURL(blob) + "#.m3u8";
 }

 function buildM3u8(m3u8list) {
  const video_m3u8 = '#EXTM3U' +
   '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=4112345,RESOLUTION=1280x720,FRAME-RATE=23.974,CODECS="avc1.640028,mp4a.40.2"' +
   '\n' + m3u8list[0] +
   '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8098235,RESOLUTION=1920x1080,FRAME-RATE=23.974,CODECS="avc1.640028,mp4a.40.2"' +
   '\n' + m3u8list[1] +
   '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2087088,RESOLUTION=848x480,FRAME-RATE=23.974,CODECS="avc1.4d401f,mp4a.40.2"' +
   '\n' + m3u8list[2] +
   '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1090461,RESOLUTION=640x360,FRAME-RATE=23.974,CODECS="avc1.4d401e,mp4a.40.2"' +
   '\n' + m3u8list[3] +
   '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=559942,RESOLUTION=428x240,FRAME-RATE=23.974,CODECS="avc1.42c015,mp4a.40.2"' +
   '\n' + m3u8list[4];
  return blobStream(video_m3u8);
 }
});
