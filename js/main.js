(function($, window, fetch){
    // cache selectors
    var self = this,
        $form = $('#uploader'),
        $dropbox = document.getElementById("dropbox"), // uses native JS api for dragdrop
        files = null,
        acl = "public-read",
        clippy = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="110" height="14" id="clippy" ><param name="movie" value="/flash/clippy.swf"/><param name="allowScriptAccess" value="always" /><param name="quality" value="high" /><param name="scale" value="noscale" /><param NAME="FlashVars" value="text=#{text}"><param name="bgcolor" value="#FFFFFF"><embed src="/flash/clippy.swf" width="110" height="14" name="clippy" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" FlashVars="text=#{text}" bgcolor="#FFFFFF" /></object>';

    // wrapper api for storage
    var linkStorage = {
        add: function(url, name, size) {
            var urls = this.read();

            var date = Math.round((new Date()).getTime() / 1000);
            var new_url = { url: url, name: name, size: size, date: date };
            urls.unshift(new_url);

            localStorage['s3uploader'] = JSON.stringify(urls);
        },
        read: function() {
            return JSON.parse(localStorage['s3uploader'] || "[]") || [];
        },
        reset: function() {
            localStorage['s3uploader'] = [];
        }
    };

    // build our html links
    var makeLink = function(url, name, size) {
        // be careful about spaces in urls
        url = url.replace(/\s/g, "%20").replace(/%/g, "%25");
        return "<a href=" + url + " target='_blank'>" + name + ' (' + size + ' KB)' + "</a>&nbsp;" + clippy.replace(/\#\{text\}/gi, url) + "<br />";
    };

    var uuidv4 = function() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }

    // display saved links
    var links = linkStorage.read();
    var links_out = "";
    for(var i = 0; i < links.length; i++) {
        links_out += makeLink(links[i].url, links[i].name, links[i].size);
    }
    $('#filename').html(links_out);

    var getHtml = function(template) {
      return template.join('\n');
    }
    
    // uploder form submission
    $form.submit(function(e){
        e.preventDefault();

        let $formFiles = document.getElementById('file').files;
        let $files = files != null ? files : $formFiles;
        files = null;

        let complete = 0;
        for (let i = 0; i < $files.length; i++) {            
            let $file = $files.item(i);
            let file_size = Math.round($file.size * 10 / 1024) / 10;

            fetch("https://s3signer.razvan.workers.dev/?name=" + encodeURIComponent($file.name)).then(response => {
                response.json().then(res => {
                    let file_url = "https://do-cdn.prazli.com/" + res.fields.key;

                    const formData = new FormData();
                    formData.append("Content-Type", $file.type);
                    Object.entries(res.fields).forEach(([k, v]) => {
                        formData.append(k, v);
                    });
                    formData.append("file", $file);


                    let divId = uuidv4();
                    let progressBarId = uuidv4();
                    let closeButtonId = uuidv4();
                    let fileHtml = getHtml([
                        '<div id="' + divId + '" class="uploaded">',
                          '<i class="far fa-file-pdf"></i>',
                          '<div class="file">',
                            '<div class="file__name">',
                              '<p><a href="' + file_url + '">' + $file.name + '</a></p>',
                              '<i id="' + closeButtonId + '" class="fas fa-times"></i>',
                            '</div>',
                            '<div id="' + progressBarId + '" class="progress">',
                              '<div class="progress-bar bg-success progress-bar-striped progress-bar-animated" style="width:5%"></div>',
                            '</div>',
                          '</div>',
                        '</div>',
                    ]);

                    $("#FileUpload").find(".wrapper").append(fileHtml);

                    document.getElementById(closeButtonId).addEventListener("click", function(e){
                        document.getElementById(divId).remove();
                    });

                    let xhr = new XMLHttpRequest();
                    xhr.addEventListener("load", function(e) {
                        complete += 1;

                        linkStorage.add(file_url, $file.name, file_size);
                        $("#" + progressBarId).remove();

                        if (complete == $files.length) {
                            viewAlbum();
                        }
                    }, false);
                    xhr.upload.addEventListener("progress", function(e) {
                        var percentComplete = e.loaded / e.total * 100;
                        $("#" + progressBarId).find(".progress-bar").css({width: percentComplete.toString() + '%'})
                    });
                    xhr.open('POST', res.url, true);
                    xhr.send(formData);
                });
            });
        }
    });
    
    // enable drag and drop
    $dropbox.addEventListener("dragenter", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $($dropbox).css({backgroundColor: "#CCC"});
    }, false);
    $dropbox.addEventListener("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $($dropbox).css({backgroundColor: "#CCC"});
    }, false);
    $dropbox.addEventListener("dragleave", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $($dropbox).css({backgroundColor: "#FFF"});
    }, false);
    $dropbox.addEventListener("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $($dropbox).css({backgroundColor: "#FFF"});
        
        var dt = e.dataTransfer;
        files = dt.files;

        if (files.length > 0) {
            $form.submit();
        }
    }, false);

})(jQuery, window, window.fetch);
