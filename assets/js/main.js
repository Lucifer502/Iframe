  window.addEventListener("message", async e => {

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
