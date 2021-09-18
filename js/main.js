(function($, window, fetch){
    // cache selectors
    var self = this,
        $form = $('#uploader'),
        $clear = $('a[data-action="clear"]'),
        $dropbox = document.getElementById("dropbox"), // uses native JS api for dragdrop
        $progress = $(".progress"),
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

    // display saved links
    var links = linkStorage.read();
    var links_out = "";
    for(var i = 0; i < links.length; i++) {
        links_out += makeLink(links[i].url, links[i].name, links[i].size);
    }
    $('#filename').html(links_out);
    
    // clear out link list
    $clear.click(function(e){
        linkStorage.reset();
        $('#filename').html("");
        e.preventDefault();
        $(this).blur();
    });
    
    // uploder form submission
    $form.submit(function(e){
        e.preventDefault();

        let $formFiles = document.getElementById('file').files
        let $files = $formFiles.length > 0 ? $formFiles : files

        let complete = 0;
        for (let i = 0; i < $files.length; i++) {
            $progress.show().find(".bar").css({width: '0%'});
            
            let $file = $files.item(i);
            let file_size = Math.round($file.size * 10 / 1024) / 10;

            fetch("https://s3signer.razvan.workers.dev/").then(response => {
                response.json().then(res => {
                    let file_url = "https://do-cdn.prazli.com/" + res.fields.key;

                    const formData = new FormData();

                    formData.append("Content-Type", $file.type);

                    Object.entries(res.fields).forEach(([k, v]) => {
                        formData.append(k, v);
                    });

                    formData.append("file", $file);

                    let xhr = new XMLHttpRequest();
                    xhr.addEventListener("load", function(e) {
                        complete += 1;

                        linkStorage.add(file_url, $file.name, file_size);
                        $('#filename').prepend(makeLink(file_url, $file.name, file_size));

                        if (complete == $files.length) {
                            $($dropbox).html("Or drop here.");
                            $progress.hide().find(".bar").css({width: 0});
                            viewAlbum("u");
                        } else {
                            var percentComplete = (complete / $files.length) * 100;
                            $progress.show().find(".bar").css({width: percentComplete.toString() + '%'});
                        }
                    }, false);
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
    
    $dropbox.addEventListener("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        $($dropbox).css({backgroundColor: "#DDD"});
        
        var dt = e.dataTransfer;
        files = dt.files;
        
        if (typeof files[0] != 'undefined') {
            var file_size = Math.round(files[0].size * 10 / 1024) / 10;
            $($dropbox).html("Dropped " + files[0].name + ' ' + file_size + ' KB');
            
            $form.submit();
        }
    }, false);

})(jQuery, window, window.fetch);
