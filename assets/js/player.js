window.addEventListener('load', message)

function message(e) {

 const r = { 0: '1080p', 1: '720p' }

 let video_config_media = JSON.parse(e.data.video_config_media);
 let sources = [];

 const streamlist = video_config_media['streams'];
 for (let stream of streamlist) {
  if (stream.format == 'adaptive_hls' && stream.hardsub_lang == 'esLA') {
   m3u8listfromstream(stream.url);
   break;
  }
 }

 function startplayer(video_m3u8) {

  for (let idx in r) {
   sources.push({ file: video_m3u8[idx], label: r[idx] + (idx > 2 ? '<sup>HD</sup>' : '') })
  }

  let playerInstance = jwplayer('player');
  playerInstance.setup({
   'sources': sources,
  })
 }

 function m3u8listfromstream(url) {
  console.log(url)

 }


 function mp4listfromstream(url) {

 }
}
