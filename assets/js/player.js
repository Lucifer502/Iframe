window.addEventListener('message', message)

function message(e) {

 const r = { 0: '1080p', 1: '720p', 2: '480p', 3: '240p', 4: '360p' };

 let rgx = /http.*$/gm;
 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let video_config_media = JSON.parse(e.data.video_config_media);
 let video_id = video_config_media['metadata']['id'];
 let sources = [];

 const streamlist = video_config_media['streams'];
 for (let stream of streamlist) {
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == 'esLA') {
   m3u8listfromstream(stream.url);
   break;
  }
 }

 function startplayer(video_m3u8) {
  console.log(video_m3u8)
  for (let idx in r) {
   sources.push({ file: video_m3u8[idx], label: r[idx] + (idx > 2 ? '<sup>HD</sup>' : '') })
  }

  let playerInstance = jwplayer('player');
  playerInstance.setup({
   'sources': sources,
  })

  jwplayer().on('ready', e => {
   document.body.querySelector('.loading_container').style.display = 'none';




  })


  setInterval(() => {
   if (jwplayer().getState() == "playing")
    localStorage.setItem(video_id, jwplayer().getPosition());
  });


 }

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
  })
 }

 function mp4listfromstream(url) {

 }

 async function m3u8listfromstream(url) {
  let m3u8list = []
  const master_m3u8 = await getAllOrigins(url);

  if (master_m3u8) {
   streams = master_m3u8.match(rgx)
   m3u8list = streams.filter((el, idx) => idx % 2 === 0)
  }

  const res = [];
  for (let i in m3u8list) {
   const video_m3u8 = await getAllOrigins(m3u8list[i]);
   m3u8list[i] = blobStream(video_m3u8);
  };
  res.push(buildM3u8(m3u8list));
  return startplayer(res)
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
