  window.addEventListener("message", async e => {
    
    const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

    let video_m3u8_array = e.data.video_config_media;
    let sources = [];

    for (let idx of [1, 0, 2, 3, 4])
      sources.push({ file: video_m3u8_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });
    startPlayer();

    function startPlayer() {

      let playerInstance = jwplayer("player_div")
      playerInstance.setup({
        "playlist": [
          {
            "sources": sources,
}, ]
      })

      jwplayer().on('ready', e => {
        document.body.querySelector(".loading_container").style.display = "none";
      })
    }
  })
