  window.addEventListener("message", async e => {

    let sources = e.data.video_config_media;

    function startPlayer() {

      let playerInstance = jwplayer("player_div")
      playerInstance.setup({
        "playlist": [
          {
            "sources": sources,
}, ]
      })
    }
  })
