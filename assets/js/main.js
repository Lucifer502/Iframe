  window.addEventListener("message", async e => {

    const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

    let rgx = /http.*$/gm;
    let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
    let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?master.m3u8/;
    let video_config_media = JSON.parse(e.data.video_config_media);
    let video_stream_url = "";
    let video_mp4_array = [];
    let user_lang = e.data.lang;
    let rows_number = 0;
    let sources = [];

    console.log(video_mp4_array);

    let dlSize = [];
    let dlUrl = [];
    for (let idx in r) {
      dlSize[idx] = document.getElementById(r[idx] + "_down_size");
      dlUrl[idx] = document.getElementById(r[idx] + "_down_url");
    }

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
        video_mp4_array = mp4ListFromStream(video_stream_url);
        break;
      }
    }

    function linkDownload(id, tentativas = 0) {
      console.log('  - Baixando: ', r[id])
      let video_mp4_url = video_mp4_array[id];

      let fileSize = "";
      let http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));
      http.onreadystatechange = () => {
        if (http.readyState == 4 && http.status == 200) {
          fileSize = http.getResponseHeader('content-length');
          if (!fileSize)
            return setTimeout(() => linkDownload(id), 5000);
          else {
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (fileSize == 0) return console.log('addSource#fileSize == 0');
            let i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
            if (i == 0) return console.log('addSource#i == 0');
            let return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
            dlSize[id].innerText = return_fileSize;
            return console.log(`[CR Premium] Source adicionado: ${r[id]} (${return_fileSize})`);
          }
        } else if (http.readyState == 4 && tentativas < 3)
          return setTimeout(() => linkDownload(id, tentativas + 1), 5000);
      }
      http.open("HEAD", video_mp4_url, true);
      http.send(null);
    }

    console.log('[CR Premium] Baixando sources:')
    for (let id of [1, 0, 2, 3, 4])
      linkDownload(id);
    // Definir URL e Tamanho na lista de download
    for (let id of [1, 0, 2, 3, 4]) {
      dlUrl[id].href = video_mp4_array[id];
    }

    function getDirectFile(url) {
      return url.replace(/\/clipFrom.*?index.m3u8/, '').replace('_,', '_').replace(url.split("/")[2], "fy.v.vrv.co");
    }

    function mp4ListFromStream(url) {
      const cleanUrl = url.replace('evs1', 'evs').replace(url.split("/")[2], "fy.v.vrv.co");
      const res = [];
      for (let i in r)
        if (streamrgx_three.test(cleanUrl) && i <= 2) // por algum motivo alguns videos da CR tem apenas 3 resoluções
          res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
      else
        res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
      return res;
    }
  })
