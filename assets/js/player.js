window.addEventListener("message", async e => {

 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?manifest.mpd/;
 let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?manifest.mpd/;
 let video_mp4_array = [];
 let sources = [];
 let video_config_media = e.data.metadata;

video_mp4_array = mp4ListFromStream(video_config_media);

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
});
