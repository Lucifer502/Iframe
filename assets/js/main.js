function startPlayer() {

    let playerInstance = jwplayer("player_div")
    playerInstance.setup({
      "playlist": [
        { 
          "title": episode_title,
          "description": video_config_media['metadata']['title'],
          "image": video_config_media['thumbnail']['url'],
          "sources": sources,
},]}})
