
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
    'use strict';

    let stop_function = {
        v: false
    };
    window["s"] = stop_function;

    function my_console_log(txt) {
        const my_console = document.querySelector("#text");
        console.log(txt);
        my_console.innerText += txt + "\n";
        my_console.scrollTo({
            top: my_console.scrollHeight,
            behavior: "smooth"
        });
    }

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0)
            return '0 Byte';
        var i = Math.trunc(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    function format(fmt) {
      var re = /(%?)(%([jds]))/g
        , args = Array.prototype.slice.call(arguments, 1);
      if(args.length) {
        fmt = fmt.replace(re, function(match, escaped, ptn, flag) {
          var arg = args.shift();
          switch(flag) {
            case 's':
              arg = '' + arg;
              break;
            case 'd':
              arg = Number(arg);
              break;
            case 'j':
              arg = JSON.stringify(arg);
              break;
          }
          if(!escaped) {
            return arg; 
          }
          args.unshift(arg);
          return match;
        });
      }

      // arguments remain after formatting
      if(args.length) {
        fmt += ' ' + args.join(' ');
      }

      // update escaped %% values
      fmt = fmt.replace(/%{2,2}/g, '%');

      return '' + fmt;
    }

    var format_1 = format;

    const lang_text = {
        is_download_file: "מוריד את קובץ %s...",
        zipping_file: "דוחס את קובץ %s...",
        ready: "הקובץ מוכן להורדה!",
        download: "מקובץ %s ירדו %s מתוך %s",
        is_not_site: "אתר זה, איננו " + "jewishmusic.fm!",
        empty_audio: "בדף זה, אין קבצי אודיו!"
    };

    function download_song(song, reply = 0) {
        let res;
        const promise = new Promise(async (resolve, reason) => {
            res = fetch(song.url, {
                headers: {
                    "Range": "bytes=0-"
                }
            });
            const response = await res;
            if (response.status < 200 || response.status >= 400) {
                if (reply < 5) {
                    reply++;
                    my_console_log("!!!");
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    resolve(download_song(song, reply));
                }
                else {
                    reason();
                    throw response;
                }
            }
            const reader = response.body.getReader();
            const contentLength = response.headers.get('Content-Length');
            let receivedLength = 0;
            const stream = new Response(new ReadableStream({
                async start(controller) {
                    const interval = setInterval(() => {
                        my_console_log(format_1(lang_text.download, song.file_name, bytesToSize(receivedLength), bytesToSize(contentLength)));
                    }, 1000);
                    while (true) {
                        if (stop_function.v) {
                            clearInterval(interval);
                            controller.close();
                            throw new Error("window closed!");
                        }
                        const { done, value } = await reader.read();
                        if (done) {
                            clearInterval(interval);
                            break;
                        }
                        receivedLength += value.length;
                        controller.enqueue(value);
                    }
                    controller.close();
                }
            }));
            const blob = await stream.blob();
            resolve(blob);
        });
        return promise;
    }

    function get_all_songs() {
        const song_list = document.
            querySelectorAll("audio > source");
        let song_list_arr = Array.from(song_list);
        const final_songs_arr = Array();
        song_list_arr.forEach((source) => {
            final_songs_arr.push({
                url: source.src.replace("http://", "https://"),
                file_name: source.parentElement.
                    parentElement.querySelector("h3").innerText
            });
        });
        return final_songs_arr;
    }
    async function download_all_songs() {
        const progress = document.querySelector("progress");
        const audio_list = get_all_songs();
        let zip = new window["JSZip"]();
        progress.max = audio_list.length;
        let i = 0;
        for (const song of audio_list) {
            if (stop_function.v) {
                throw new Error("window closed!");
            }
            my_console_log(format_1(lang_text.is_download_file, song.file_name));
            const blob = await download_song(song);
            my_console_log(format_1(lang_text.zipping_file, song.file_name));
            const ext = song.url.split(".").pop();
            zip.file(song.file_name + "." + ext, blob, { binary: true });
            i++;
            progress.value = i;
            //progress_val.set(i);
        }
        my_console_log(format_1(lang_text.ready));
        await save_zip_file(zip);
    }
    async function save_zip_file(zip) {
        const albom_title = document.querySelector(".album-title").innerText, albom_art = document.querySelector(".arts_name").innerText, file_name = `${albom_title} - ${albom_art}`;
        const zipFile = await zip.generateAsync({ type: "blob" });
        save_blob_file(zipFile, file_name);
    }
    async function save_blob_file(blob, file_name) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = file_name || "download";
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function my_require(url) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        document.head.appendChild(script);
        await new Promise((resolve) => script.onload = resolve);
    }

    const html = ` <div id="window" style="visibility:visible; opacity: 1;"> <div id="bar"> <div id="window-text">הורדה מאתר Jewish-music.Fm</div> <div id="close" on:click="close()" ></div> </div> <div id="window-content"> <progress value="0" max="1"></progress> <div id="text"></div>> <div id="credit"> <a href="https://github.com/MusiCode1/jewish-music.fm" target="_"> <em>MusiCode</em> </a> </div> </div> </div> `;
    const style_html = ` #window { position: fixed; left: 10%; right: 10%; top: 20%; bottom: 20%; max-width: 660px; margin: auto; backdrop-filter: blur(8px); border-radius: 30px; background: rgba(255, 255, 255, 0.73); box-shadow: 0px 0px 13px 1px; transition: all 3s ease-out; z-index: 20; } #bar { position: absolute; height: 50px; left: 0; right: 0; background: #7c7c7c; border-radius: 30px 30px 0px 0px; } #window-text { height: 100%; display: flex; align-items: center; justify-content: space-around; text-align: center; font-size: 24px; line-height: 28px; color: #ececec; font-family: system-ui; position: relative; width: calc(100% - 60px); } #close { position: absolute; width: 20px; height: 20px; left: 40px; top: 15px; background: #de4f4f; border-radius: 50%; } #close:hover { background: #f87878; } #window-content { position: relative; top: 50px; padding: 2em; height: calc(100% - 50px); box-sizing: border-box; } progress { width: 100%; height: 50px; } #text { font-size: 20px; font-family: system-ui; overflow-y: scroll; height: calc(100% - 50px); direction: rtl; } #credit { text-align: left; color: #b6abab; }`;
    async function add_html() {
        const style = document.createElement("style");
        style.innerHTML = style_html;
        const the_div = document.createElement("div");
        the_div.innerHTML = html;
        the_div.classList.add("download_from_jewish_music");
        document.body.appendChild(the_div);
        document.body.appendChild(style);
        await new Promise((resolve) => the_div.onload = resolve);
    }

    window.close = close;
    function close() {
        const app = document.querySelector("#window");
        stop_function.v = true;
        app.style.opacity = "0";
        app.style.visibility = "hidden";
        setTimeout(() => {
            app.remove();
        }, 3 * 1000);
    }

    function check() {
        const audio_list = document.querySelectorAll("audio > source");
        if (window.location.hostname !== "jewishmusic.fm") {
            throw new Error(lang_text.is_not_site);
        }
        if (audio_list.length < 1) {
            throw new Error(lang_text.empty_audio);
        }
    }

    (window["download_from_jewish_music"] = async function download_from_jewish_music() {
        const app = document.querySelector(".download_from_jewish_music");
        try {
            console.log("Musicode7");
            console.log("https://github.com/MusiCode1/jewish-music.fm");
            check();
            if (!app) {
                await add_html();
            }
            await my_require("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");
            await download_all_songs().finally(() => {
                close();
            });
        }
        catch (error) {
            if (error.massage === "window closed!") {
                console.log(error.massage);
                throw error;
            }
            else {
                alert(error);
                close();
                throw error;
            }
        }
    })();

}());
//# sourceMappingURL=bundle.js.map
