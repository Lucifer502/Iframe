window.addEventListener('message', async e => {

  let video_config_media = JSON.parse(e.data.stream);

  console.log(video_config_media);

})
