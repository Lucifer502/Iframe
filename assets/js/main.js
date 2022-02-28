  window.addEventListener("message", async e => {
    
    const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

    let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
    let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;

    let video_config_media = JSON.parse(e.data.video_config_media);
    let video_mp4_array = mp4ListFromStream(video_config_media);
    let sources = [];

    console.log(video_config_media);

    function mp4ListFromStream(url) {
    const cleanUrl = url.replace('evs1', 'evs').replace('/p/', '/').replace(url.split("/")[2], "fy.v.vrv.co");
    const res = [];
    for (let i in r)
      if (streamrgx_three.test(cleanUrl) && i <= 2) // por algum motivo alguns videos da CR tem apenas 3 resoluções
        res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
      else
        res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
    return res;
    }
  })
