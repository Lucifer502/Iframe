window.addEventListener("message", async e => {

 function pegaString(str, first_character, last_character) {
  if (str.match(first_character + "(.*)" + last_character) == null) {
   return null;
  } else {
   new_str = str.match(first_character + "(.*)" + last_character)[1].trim()
   return new_str;
  }
 }

 const r = { 0: '720p', 1: '1080p', 2: '480p', 3: '360p', 4: '240p' };

 let allorigins = "https://crp-proxy.herokuapp.com/get?url=";
 let preservedState = null;
 let description = e.data.description;
 let href = e.data.href;
 let url = await getHTML(href)
 let video_config_media = "";
 let user_lang = 'es-LA';
 let video_mp4_array = [];
 let sources = [];

 console.log(href)
 console.log(description)

 preservedState = JSON.parse(pegaString(url, "__INITIAL_STATE__ = ", ";"))

 console.log(preservedState)

 let id = preservedState.watch.id;
 let playback = preservedState.content.byId[id].playback;
 let thumbnail = preservedState.content.byId[id].images.thumbnail[0][7].source;

 video_config_media = await getStream(playback);

 const streamlist = video_config_media['streams']
 video_mp4_array = mp4ListFromStream(streamlist.adaptive_hls[user_lang].url);

 for (let idx of [1, 0, 2, 3, 4])
  sources.push({ file: video_mp4_array[idx], label: r[idx] + (idx < 2 ? '<sup><sup>HD</sup></sup>' : '') });
 startPlayer();
});

function startPlayer() {

 let playerInstance = jwplayer('player_div')
 playerInstance.setup({
  'playlist': [{
   'image': thumbnail,
   'sources': sources,
  }]
 })

 jwplayer().on('ready', e => {

  document.body.querySelector(".loading_container").style.display = "none";
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

async function getHTML(url) {
 const html = await getAllOrigins(url)
 return html;
}

async function getStream(url) {
 const episodeStream = JSON.parse(await getAllOrigins(url));
 return episodeStream;
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
});
