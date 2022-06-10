window.addEventListener("message", async e => {


let allorigins = "https://api.allorigins.win/get?url="

console.log(e.data)
const res = await getAllOrigins(e.data);

var ifrm = document.createElement('iframe')
  ifrm.setAttribute('style', 'display:none');
  ifrm.setAttribute('frameborder', '0');
  ifrm.setAttribute('scrolling', 'no');
  ifrm.setAttribute('width', '0px');
  ifrm.setAttribute('height', '0px');
  ifrm.setAttribute('id', 'ifrm');
  ifrm.setAttribute('src', 'window.top.location.href');

  document.body.appendChild(ifrm)
  ifrm.onload = () => {
    ifrm.contentWindow.postMessage(res}, '*')
  }

console.log(res)

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
})
