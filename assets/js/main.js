
window.addEventListener("message", async e => {

  let initial_state = e.data.video_config_media;
  let id = initial_state.watch.id;
  let config_media = initial_state.content.byId[id]
  let playback = config_media.playback;
  console.log(playback)





})
