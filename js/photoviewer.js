// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}

function runGalleria(imageKeys){
    const galleriaData = imageKeys.map(function(key) {
    return {
      big: "https://do-cdn.prazli.com/" + key,
      thumb: "https://do-cdn.prazli.com/cdn-cgi/image/quality=10/" + key,
    };
  });

  // document.getElementById('viewer').innerHTML = html.join("\n");
  // document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');

  Galleria.loadTheme('https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/themes/folio/galleria.folio.min.js');
  Galleria.run('.galleria', {
    dataSource: galleriaData
  });
}

// Show the photos that exist in an album.
function viewAlbum() {
  window.fetch("https://sfo3.digitaloceanspaces.com/prazli2021")
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          var imageKeys = []
          for (let item of data.getElementsByTagName("Key")) {
            const regex = new RegExp('^u/.+$');
            const key = item.textContent;
            if (regex.test(key)) {
              imageKeys.push(key);
            }
          }
          
          const html = imageKeys.map(function(key) {
            return getHtml([
              '<a href="' + "https://do-cdn.prazli.com/" + key + '"/>',
              '<img src="' + "https://do-cdn.prazli.com/" + key + '"/>',
            ]);
          });

          runGalleria(imageKeys);

          // document.getElementById('viewer').innerHTML = html.join("\n");
          // document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');
        });
}