window.addEventListener("message", async e => {

  let video_config_media = e.data.video_config_media;
  let id = video_config_media.watch.id;

  console.log(video_config_media);

  const streamlist = video_config_media['content']
  console.log(streamlist)
  console.log(id)

})
