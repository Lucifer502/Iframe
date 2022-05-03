window.addEventListener("message", async e => {

 const r = { 0: '1080', 1: '720', 2: '480', 3: '360', 4: '240' };

 let rgx = /http.*$/gm;
 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let video_config_media = JSON.parse(e.data.video_config_media);
 let video_id = video_config_media['metadata']['id'];
 let download = document.createElement('a');
 let up_next_enable = e.data.up_next_enable;
 let user_lang = e.data.user_lang;
 let up_next = e.data.up_next;
 let series = e.data.series;
 let episode_translate = "";
 let video_stream_url = "";
 let video_m3u8_array = [];
 let video_mp4_array = [];
 let final_translate = "";
 let episode_title = "";
 let rows_number = 0;
 let sources = [];

 const streamlist = video_config_media['streams'];
 for (let stream of streamlist) {
  if (stream.format == 'trailer_hls' && stream.hardsub_lang == user_lang || (streamlist.length < 15 && stream.hardsub_lang === null))
   if (rows_number <= 4) {
    const arr_idx = (rows_number === 0 ? 2 : (rows_number === 2 ? 0 : rows_number));
    video_mp4_array[arr_idx] = getDirectFile(stream.url);
    rows_number++;
    if (rows_number > 4) {
     video_m3u8_array = video_mp4_array;
    }
   }
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang) {
   video_stream_url = stream.url;
   video_m3u8_array = await m3u8ListFromStream(video_stream_url);
   video_mp4_array = mp4ListFromStream(video_stream_url);
  }
 }

 const epLangs = { "esLA": "Episodio" };
 const fnLangs = { "esLA": "FINAL" };
 episode_translate = `${epLangs[user_lang] ? epLangs[user_lang] : "Episode"} `;
 final_translate = ` (${fnLangs[user_lang] ? fnLangs[user_lang] : "FINAL"})`;

 if (series) {
  episode_title = series + ' - ' + episode_translate + video_config_media['metadata']['display_episode_number'];
 } else if (video_config_media['metadata']['up_next']) {
  let prox_ep_number = video_config_media['metadata']['up_next']['display_episode_number'];
  episode_title = video_config_media['metadata']['up_next']['series_title'] + ' - ' + prox_ep_number.replace(/\d+|OVA/g, '') + video_config_media['metadata']['display_episode_number'];
 } else
  episode_title = episode_translate + video_config_media['metadata']['display_episode_number'] + final_translate;

 function getFileSize(id, intentos = 0) {
  let video_mp4_url = video_mp4_array[id];

  let fileSize = "";
  let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
  http.onreadystatechange = () => {
   if (http.readyState == 4 && http.status == 200) {
    fileSize = http.getResponseHeader('content-length');
    if (!fileSize)
     return setTimeout(() => getFileSize(id), 5000);
    else {
     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (fileSize == 0) return console.log('addSource#fileSize == 0');
     let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
     if (i == 0) return console.log('addSource#i == 0');
     let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }
   } else if (http.readyState == 4 && intentos < 3)
    return setTimeout(() => getFileSize(id, intentos + 1), 5000);
  }
  http.open("HEAD", video_mp4_url, true);
  http.send(null);
 }

 for (let idx in r) {
  getFileSize(idx)
  sources.push({ file: video_m3u8_array[idx], label: r[idx] + 'p' + (idx < 2 ? '<sup>HD</sup>' : '') });
  startPlayer();
 }

 function startPlayer() {
  let playerInstance = jwplayer("player")
  playerInstance.setup({
   "playlist": [
    {
     "title": episode_title,
     "description": video_config_media['metadata']['title'],
     "image": video_config_media['thumbnail']['url'],
     "sources": sources,
        },
      ],
   "width": "100%",
   "height": "100%",
   "autostart": false,
   "displayPlaybackLabel": true,
   "primary": "html5",
   "cast": {},
   "playbackRateControls": [0.5, 0.75, 1, 1.25, 1.5, 2]
  })

  setInterval(() => {
   let duration = jwplayer().getDuration()
   let position = jwplayer().getPosition()

   if (position == duration && up_next_enable == true)
    window.top.location.href = up_next;
  }, 1000)

  let rewind_iconPath = "replay-10s.svg";
  let rewind_id = "rewind-video-button";
  let rewind_tooltipText = "Regresar 30s";

  let forward_iconPath = "forward-30s.svg";
  let forward_id = "forward-video-button";
  let forward_tooltipText = "Avanzar 30s";

  let download_iconPath = "download_icon.svg";
  let download_id = "download-video-button";
  let download_tooltipText = "Descargar";
  let didDownload = false;

  const rewind_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() - 10)
  const forward_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() + 30)

  function download_ButtonClickAction() {
   let current_quality = jwplayer().getVisualQuality()
   for (let i in r) {
    if (current_quality.level.height == r[i]) {
     download.setAttribute('href', video_mp4_array[i])
     download.click()
    };
   };
  }

  playerInstance
   .addButton(forward_iconPath, forward_tooltipText, forward_ButtonClickAction, forward_id)
   .addButton(rewind_iconPath, rewind_tooltipText, rewind_ButtonClickAction, rewind_id)
   .addButton(download_iconPath, download_tooltipText, download_ButtonClickAction, download_id);

  jwplayer().on('ready', e => {
   if (localStorage.getItem(video_id) != null) {
    const time = localStorage.getItem(video_id);
    document.getElementsByTagName("video")[0].currentTime = time >= 5 ? time - 5 : time;
   }

   if (localStorage.getItem("next_up") === "true") {
    localStorage.setItem("next_up", false)
    jwplayer().play();
   }
   document.body.querySelector(".loading_container").style.display = "none";
  });

  jwplayer().on('viewable', e => {
   const old = document.querySelector('.jw-button-container > .jw-icon-rewind')
   if (!old) return
   const btn = query => document.querySelector(`div[button="${query}"]`)
   const btnContainer = old.parentElement
   btnContainer.insertBefore(btn(rewind_id), old)
   btnContainer.insertBefore(btn(forward_id), old)
   btnContainer.removeChild(old)
  })

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
  }, 1000);
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
