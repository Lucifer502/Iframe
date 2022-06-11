window.addEventListener('message', async e => {

    const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

    let rgx = /http.*$/gm;
    let streamrgx = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
    let streamrgx_three = /_,(\d+.mp4),(\d+.mp4),(\d+.mp4),.*?m3u8/;
    let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
    let playback = e.data.playback
    let next_enable = e.data.next_enable
    let next = e.data.next
    let title = e.data.title
    let thumbnail = e.data.thumbnail
    let sources = [];

    const request = await getAllOrigins(playback)
    const response = JSON.parse(await request)
console.log(response)
    const stream = response.streams.adaptive_hls['es-LA'].url

    video_m3u8_array = await m3u8ListFromStream(stream)
    video_mp4_array = mp4ListFromStream(stream)

    console.log(video_m3u8_array)
    console.log(video_mp4_array)

    for (let idx of [1, 0, 2, 3, 4])
      sources.push({ file: video_m3u8_array[idx], label: r[idx] });
    console.log(sources)
    startPlayer()

    function startPlayer() {
      let playerInstance = jwplayer("player")
      playerInstance.setup({
        "playlist": [
          {
            "title": title,
            "image": thumbnail,
            "sources": sources,
        },
        next_enable ? {
            "file": "https://i.imgur.com/8wEeX0R.mp4",
        } : {}
      ],
        "related": { displayMode: 'none' },
        "width": "100%",
        "height": "100%",
        "autostart": false,
        "displayPlaybackLabel": true,
        "primary": "html5",
        "cast": {},
        "playbackRateControls": [0.5, 0.75, 1, 1.25, 1.5, 2]
      }).on('playlistItem', e => {
        if (e.index > 0 && next_enable) {
          jwplayer().setControls(false);
          jwplayer().setConfig({
            repeat: true
          });
          jwplayer().play();
          localStorage.setItem("next_up", true);
          localStorage.setItem("next_up_fullscreen", jwplayer().getFullscreen());
          window.top.location.href = next;
        }
      })

      let rewind_iconPath = "assets/icon/replay-10s.svg";
      let rewind_id = "rewind-video-button";
      let rewind_tooltipText = "Regresar 10s";

      let forward_iconPath = "assets/icon/forward-30s.svg";
      let forward_id = "forward-video-button";
      let forward_tooltipText = "Avanzar 30s";

      let download_iconPath = "assets/icon/download_icon.svg";
      let download_id = "download-video-button";
      let download_tooltipText = "Descargar";

      const rewind_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() - 10)
      const forward_ButtonClickAction = () => jwplayer().seek(jwplayer().getPosition() + 30)

      function downloadButton() {
        modal.style.visibility = 'visible';
      }
      const modal = document.querySelector('.modal')
      const cerrar = document.querySelector('.close')

      cerrar.addEventListener('click', e => {
        modal.style.visibility = 'hidden';
      })

      playerInstance
        .addButton(forward_iconPath, forward_tooltipText, forward_ButtonClickAction, forward_id)
        .addButton(rewind_iconPath, rewind_tooltipText, rewind_ButtonClickAction, rewind_id)
        .addButton(download_iconPath, download_tooltipText, downloadButton, download_id);

      jwplayer().on('ready', e => {
        if (localStorage.getItem(video_id) != null) {
          const t = localStorage.getItem(video_id);
          document.getElementsByTagName("video")[0].currentTime = t >= 5 ? t - 5 : t;
        }

        if (localStorage.getItem("next_up") === "true") {
          localStorage.setItem("next_up", false)
          jwplayer().play();
        }

        document.querySelector(".loading_container").style.display = "none";
      });

      jwplayer().on('viewable', e => {
        const old = document.querySelector('.jw-button-container > .jw-icon-rewind')
        if (!old) return
        const btn = query => document.querySelector(`div[button="${query}"]`)
        const btnContainer = old.parentElement
        btnContainer.insertBefore(btn(rewind_id), old)
        btnContainer.insertBefore(btn(forward_id), old)
        btnContainer.removeChild(old)
      })

      jwplayer().on('error', e => {
        console.log(e)
        codes = { 232011: "https://i.imgur.com/OufoM33.mp4" };
        if (codes[e.code]) {
          jwplayer().load({
            file: codes[e.code]
          });
          jwplayer().setControls(false);
          jwplayer().setConfig({ repeat: true });
          jwplayer().play();
        }
      });

      setInterval(() => {
        if (jwplayer().getState() == "playing")
          localStorage.setItem(video_id, jwplayer().getPosition());
      });
    }

    function getAllOrigins(url) {
    return new Promise(async (resolve, reject) => {
      await $.ajax({
          async: true,
          type: "GET",
          url: allorigins + encodeURIComponent(url),
          responseType: 'json'
        })
        .then(res => {
          resolve(res.contents ?? res)
        })
        .catch(err => reject(err));
    })
  }

    function mp4ListFromStream(url) {
      const cleanUrl = url.replace('evs1', 'evs').replace(url.split("/")[2], "fy.v.vrv.co");
      const res = [];
      for (let i in r)
        if (streamrgx_three.test(cleanUrl) && i <= 2)
          res.push(cleanUrl.replace(streamrgx_three, `_$${(parseInt(i)+1)}`))
      else
        res.push(cleanUrl.replace(streamrgx, `_$${(parseInt(i)+1)}`))
      return res;
    }

    async function m3u8ListFromStream(url) {
      let m3u8list = []
      const master_m3u8 = await getAllOrigins(url);

      if (master_m3u8) {
        streams = master_m3u8.match(rgx)
        m3u8list = streams.filter((el, idx) => idx % 2 === 0)
      }
      const res = [];
      for (let i in m3u8list) {
        const video_m3u8 = await getAllOrigins(m3u8list[i]);
        m3u8list[i] = blobStream(video_m3u8);
      }
      res.push(buildM3u8(m3u8list));
      return res;
    }

    function blobStream(stream) {
      const blob = new Blob([stream], {
        type: "text/plain; charset=utf-8"
      });
      return URL.createObjectURL(blob) + "#.m3u8";
    }

    function buildM3u8(m3u8list) {
      const video_m3u8 = '#EXTM3U' +
        '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=4112345,RESOLUTION=1280x720,FRAME-RATE=23.974,CODECS="avc1.640028,mp4a.40.2"' +
        '\n' + m3u8list[0] +
        '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=8098235,RESOLUTION=1920x1080,FRAME-RATE=23.974,CODECS="avc1.640028,mp4a.40.2"' +
        '\n' + m3u8list[1] +
        '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2087088,RESOLUTION=848x480,FRAME-RATE=23.974,CODECS="avc1.4d401f,mp4a.40.2"' +
        '\n' + m3u8list[2] +
        '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=1090461,RESOLUTION=640x360,FRAME-RATE=23.974,CODECS="avc1.4d401e,mp4a.40.2"' +
        '\n' + m3u8list[3] +
        '\n#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=559942,RESOLUTION=428x240,FRAME-RATE=23.974,CODECS="avc1.42c015,mp4a.40.2"' +
        '\n' + m3u8list[4];
      return blobStream(video_m3u8);
    }
  })
