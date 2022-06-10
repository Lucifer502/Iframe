window.addEventListener("message", async e => {

console.log(e)
let allorigins = "https://api.allorigins.win/get?url="

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
