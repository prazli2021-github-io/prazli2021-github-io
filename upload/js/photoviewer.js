function getHtml(template) {
  return template.join('\n');
}

function runLightGallery(imageKeys) {
  const html = imageKeys.map(function(key) {
    return getHtml([
      '<a href="https://do-cdn.prazli.com/' + key + '" target="_blank" rel="noopener noreferrer">',
        '<img src="https://do-cdn.prazli.com/cdn-cgi/image/quality=10/' + key + '" />',
      '</a>',
      ]);
  });

  document.getElementById('lightGallery').innerHTML = html.join("\n");

  jQuery("#lightGallery")
  .justifiedGallery({
    captions: false,
    lastRow: "center",
    rowHeight: 180,
    margins: 5
  });
}

// Show the photos that exist in an album.
function viewAlbum() {
  window.fetch("https://sfo3.digitaloceanspaces.com/prazli2021")
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
          var imageKeys = [];
          for (let item of data.getElementsByTagName("Key")) {
            const regex = new RegExp('^u/.+$');
            const key = item.textContent;
            if (regex.test(key)) {
              imageKeys.push(key);
            }
          }
          imageKeys = imageKeys.slice(0, 20);

          runLightGallery(imageKeys);
        });
}