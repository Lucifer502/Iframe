  window.addEventListener("message", async e => {

    const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

    let rgx = /http.*$/gm;
    let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
    let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
    let video_config_media = JSON.parse(e.data.video_config_media);
    let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
    let video_mp4_array = [];
    let user_lang = e.data.lang;
    let rows_number = 0;
    let sources = [];

    console.log(video_config_media);

    const streamlist = video_config_media['streams'];
    for (let stream of streamlist) {
      // Premium                                                             vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv - versões "International Dub"
      if (stream.format == 'trailer_hls' && stream.hardsub_lang == user_lang || (streamlist.length < 15 && stream.hardsub_lang === null))
        if (rows_number <= 4) {
          // video_m3u8_array.push(await getDirectStream(stream.url, rows_number));
          const arr_idx = (rows_number === 0 ? 2 : (rows_number === 2 ? 0 : rows_number));
          video_mp4_array[arr_idx] = getDirectFile(stream.url);
          rows_number++;
          // mp4 + resolve temporario até pegar link direto da m3u8
          if (rows_number > 4) {
            //video_m3u8_array = video_mp4_array;
            for (let i in r) {
              const idx = i;
              setTimeout(() => request[idx].resolve(), 400);
            }
            break;
          }
        }
      // Padrão
      if (stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang) {
        video_stream_url = stream.url;
        video_m3u8_array = await m3u8ListFromStream(video_stream_url);
        video_mp4_array = mp4ListFromStream(video_stream_url);
        break;
      }
    }

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
