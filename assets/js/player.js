window.addEventListener('message', async e => {

 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let rgx = /http.*$/gm;
 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let video_config_media = e.data.video_config_media;
 let up_next = e.data.up_next;
 let up_next_enable = e.data.up_next_enable;
 let user_lang=e.data.user_lang;
 let video_mp4_array = []
 let video_m3u8_array = [];
 let video_stream_url = "";
 let sources = []

 const streamlist = video_config_media['streams'];
 for (let stream of streamlist) {
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang) {
   video_stream_url = stream.url;
   video_m3u8_array = await m3u8ListFromStream(video_stream_url);
   video_mp4_array = mp4ListFromStream(video_stream_url);
   break;
  }
 }

 for (let idx of [1, 0, 2, 3, 4])
  sources.push({ file: video_m3u8_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });

 let player = jwplayer('player_div')
 player.setup({
  'playlist': [{
   'sources': sources,
 }]
 }).on('playlistItem', e => {
  console.log(sources)
 })

 jwplayer().on('ready', e => {
  document.body.querySelector(".loading_container").style.display = "none";
 });

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

 async function m3u8ListFromStream(url) {
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
})
