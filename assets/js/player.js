window.addEventListener('message', message)

async function message(e) {

 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '240p', 4: '360p' };

 let rgx = /http.*$/gm;
 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let video_config_media = JSON.parse(e.data.video_config_media);
 let video_id = video_config_media['metadata']['id'];
 let up_next = e.data.up_next;
 let sources = [];

 let dlSize = [];
 let dlUrl = [];
 for (let idx in r) {
  dlSize[idx] = document.getElementById(r[idx] + "_down_size");
  dlUrl[idx] = document.getElementById(r[idx] + "_down_url");
 };

 const streamlist = video_config_media['streams'];
 for (let stream of streamlist) {
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == 'esLA') {
   m3u8listfromstream(stream.url);
   mp4listfromstream(stream.url);
   break;
  };
 };

 function startplayer(video_m3u8_array) {
  console.log(video_m3u8_array)
  for (let idx of [1, 0, 2, 3, 4])
   sources.push({ file: video_m3u8_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });

  let playerInstance = jwplayer('player');
  playerInstance.setup({
   'sources': sources,
  });

  let rewind_iconPath = "assets/icon/replay-10s.svg";
  let rewind_id = "rewind-video-button";
  let rewind_tooltipText = "Regresar 10s";

  let forward_iconPath = "assets/icon/forward-30s.svg";
  let forward_id = "forward-video-button";
  let forward_tooltipText = "Avanzar 30s";

  let download_iconPath = "assets/icon/download_icon.svg";
  let download_id = "download-video-button";
  let download_tooltipText = "Download";

  const modal = document.querySelector('.modal');

  const rewind_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() - 10)
  const forward_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() + 30)

  function download_ButtonClickAction() {
   if (jwplayer().getEnvironment().OS.mobile == true) {
    modal.style.height = "170px";
    modal.style.overflow = "auto";
   }
   modal.style.visibility = 'visible'

   let id = jwplayer().getCurrentQuality()

   let download = document.createElement('a')
   download.setAttribute('href', sources[id]['file'])
   download.click()
  }

  playerInstance
   .addButton(forward_iconPath, forward_tooltipText, forward_ButtonClickAction, forward_id)
   .addButton(rewind_iconPath, rewind_tooltipText, rewind_ButtonClickAction, rewind_id)
   .addButton(download_iconPath, download_tooltipText, download_ButtonClickAction, download_id);


  jwplayer().on('ready', e => {
   document.body.querySelector('.loading_container').style.display = 'none';

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

  setInterval(() => {
   if (jwplayer().getState() == "playing")
    localStorage.setItem(video_id, jwplayer().getPosition());
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
 };

 function getAllOrigins(url) {
  return new Promise(async (resolve, reject) => {
   await $.ajax({
     async: true,
     type: "GET",
     url: 'https://crp-proxy.herokuapp.com/get?url=' + encodeURIComponent(url),
     responseType: 'json'
    })
    .then(res => {
     resolve(res.contents ?? res)
    })
    .catch(err => reject(err));
  });
 };

 function linkdDownload(video_mp4_array, id) {
  let video_mp4_url = video_mp4_array[id];

  let fileSize = "";
  let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
  http.onreadystatechange = () => {
   if (http.readyState == 4 && http.status == 200) {
    fileSize = http.getResponseHeader('content-length');
    if (!fileSize)
     return setTimeout(() => linkDownload(id), 5000);
    else {
     let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
     if (fileSize == 0) return console.log('addSource#fileSize == 0');
     let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
     if (i == 0) return console.log('addSource#i == 0');
     let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
     dlSize[id].innerText = return_fileSize;
     return console.log(`Tamaño de ${r[id]} (${return_fileSize})`);
    }
   } else if (http.readyState == 4 && tentativas < 3)
    return setTimeout(() => linkDownload(id, tentativas + 1), 5000);
  }
  http.open("HEAD", video_mp4_url, true);
  http.send(null);
 };

 function mp4listfromstream(url) {
  const cleanUrl = url.replace(url.split("/")[2], "fy.v.vrv.co");
  const res = [];
  for (let i in r)
   if (streamrgx_three.test(cleanUrl) && i <= 2)
    res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`));
   else
    res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`));

  for (let id in r) {
   linkdDownload(res, id);
  };
 };

 async function m3u8listfromstream(url) {
  let m3u8list = []
  const master_m3u8 = await getAllOrigins(url);

  if (master_m3u8) {
   streams = master_m3u8.match(rgx)
   m3u8list = streams.filter((el, idx) => idx % 2 === 0)
  };

  const res = [];
  for (let i in m3u8list) {
   const video_m3u8 = await getAllOrigins(m3u8list[i]);
   m3u8list[i] = blobStream(video_m3u8);
  };
  res.push(buildM3u8(m3u8list));
  return startplayer(res);
 };

 function blobStream(stream) {
  const blob = new Blob([stream], {
   type: "text/plain; charset=utf-8"
  });
  return URL.createObjectURL(blob) + "#.m3u8";
 };

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
 };
};
