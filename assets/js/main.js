  window.addEventListener("message", async e => {

    let sources = e.data.video_config_media;

    startPlayer();

    function startPlayer() {

      let playerInstance = jwplayer("player_div")
      playerInstance.setup({
        "playlist": [
          {
            "file": sources,
}, ]
      })

      jwplayer().on('ready', e => {
        document.body.querySelector(".loading_container").style.display = "none";
      })
    }
  })
