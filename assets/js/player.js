window.addEventListener("message", async e => {
 
let user_lang = e.data.lang;
let video_stream_url = "";
let video_mp4_array = streamlist(e.data.config);



function streamlist(url){

for(let stream of url){

if(stream.format == 'adaptive_hls' && stream.hardsub_lang == user_lang){

video_stream_url = stream.url;
console.log(video_stream_url);


}

}

}

});
