function startPlayer() {

    let playerInstance = jwplayer("player_div")
    playerInstance.setup({
      "playlist": [
        {
          "sources": sources,
}, ]
    })
  }
