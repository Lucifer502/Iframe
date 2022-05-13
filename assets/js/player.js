window.addEventListener("message", async e => {

 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
 let video_config_media = JSON.parse(e.data.video_config_media);
 let user_lang = e.data.lang;
 let up_next_enable = e.data.up_next_enable;

 const streamlist = video_config_media['streams']
 let streams = getStreamsUrl()

 function getStreamsUrl() {
  return new Promise((resolve) => {
   for (let stream of streamlist) {
    if (stream.format == "adaptive_hls" && stream.hardsub_lang == user_lang) {
     console.log(stream.url)
     video_stream_url = stream.url
     video_mp4_array = mp4ListFromStream(video_stream_url);
     resolve(startPlayer(video_mp4_array))
     break;
    }
   }
  })
 }

 function startPlayer(playlist, sources = []) {
  for (let id of [1, 0, 2, 3, 4]) {
   sources.push({ file: playlist[id], label: r[id] })
  }

  let playerInstance = jwplayer("player_div")
  playerInstance.setup({
   "playlist": [{
    "sources": sources,
   }]
  }).play()
//jwplayer().setFullscreen()
  console.log(sources)
  console.log(jwplayer())

  if (up_next_enable) {
   localStorage.setItem("fullscreen", true)
  }

  jwplayer().on('ready', e => {
jwplayer().setFullscreen();
   if (localStorage.getItem("fullscreen") == "true") {
     localStorage.setItem("fullscreen",false)
    jwplayer().setFullscreen()
   }

   document.querySelector('.loading_container').style.display = "none"

  })
 }

 function mp4ListFromStream(url) {
  const cleanUrl = url.replace(url.split("/")[2], "fy.v.vrv.co");
  const res = [];
  for (let i in r)
   if (streamrgx_three.test(cleanUrl) && i <= 2) {
    res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
   }
  else {
   res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
  }
  return res;
 }
})
