// A utility function to create HTML.
function getHtml(template) {
  return template.join('\n');
}

// Show the photos that exist in an album.
function viewAlbum(albumName) {
  window.fetch("https://sfo3.digitaloceanspaces.com/prazli2021")
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          var imageURLs = []
          for (let item of data.getElementsByTagName("Key")) {
            const regex = new RegExp('^u/.+$');
            const key = item.textContent;
            if (regex.test(key)) {
              const photoUrl = "https://do-cdn.prazli.com/" + key;
              imageURLs.push(photoUrl);
            }
          }
          
          const html = imageURLs.map(function(photoUrl) {
            return getHtml([
            '<span>',
              '<div>',
                '<br/>',
                '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
              '</div>',
            '</span>',
            ]);
          });

        var htmlTemplate = [
          '<div>',
            getHtml(html),
          '</div>',
        ]
        document.getElementById('viewer').innerHTML = getHtml(htmlTemplate);
        document.getElementsByTagName('img')[0].setAttribute('style', 'display:none;');
        });
}