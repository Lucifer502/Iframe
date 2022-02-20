  window.addEventListener("message", async e => {

    let sources = e.data.video_config_media;

    startPlayer();

    function startPlayer() {

      let playerInstance = jwplayer("player_div")
      playerInstance.setup({
        "playlist": [
          {
            "files": sources,
}, ]
      })
    }
  })
