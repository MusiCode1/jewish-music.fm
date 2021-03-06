import { stop_function } from "./globals";
import { my_console_log } from "./my-console-log";
import { download_song } from "./download-song";
import type { Song } from "./Song";
import { lang_text } from "./text";
import format from "format-util";

function get_all_songs() {
  const song_list: NodeListOf<HTMLAudioElement> =
    document.querySelectorAll("audio > source");

  let song_list_arr = Array.from(song_list);

  const final_songs_arr: Array<Song> = Array();

  song_list_arr.forEach((source) => {
    final_songs_arr.push({
      url: source.src.replace("http://", "https://"),

      file_name:
        source.parentElement.parentElement.querySelector("h3").innerText,
    });
  });

  return final_songs_arr;
}

export async function download_all_songs() {
  const progress = document.querySelector<HTMLProgressElement>("progress");

  const audio_list = get_all_songs();

  let zip = new window["JSZip"]();

  progress.max = audio_list.length;

  let i = 0;

  for (const song of audio_list) {
    if (stop_function.v) {
      throw new Error("window closed!");
    }

    my_console_log(format(lang_text.is_download_file, song.file_name));

    const blob = await download_song(song);
    if (blob !== null) {
      my_console_log(format(lang_text.zipping_file, song.file_name));

      const ext = song.url.split(".").pop();

      zip.file(song.file_name + "." + ext, blob, { binary: true });

      i++;

      progress.value = i;
    } else {
      my_console_log(format(lang_text.error_download_file, song.file_name));
    }

    //progress_val.set(i);
  }

  my_console_log(format(lang_text.is_download_image));

  fetch(document.querySelector<HTMLImageElement>(".webpexpress-processed").src)
    .then((response) => response.blob())
    .then((blob) => {
      zip.file("AlbumArtSmall", blob, { binary: true });
      zip.file("Folder", blob, { binary: true });
    });

  my_console_log(format(lang_text.make_file));

  await save_zip_file(zip);

  my_console_log(format(lang_text.ready));
}

async function save_zip_file(zip) {
  const albom_title =
      document.querySelector<HTMLElement>(".album-title").innerText,
    albom_art = document.querySelector<HTMLElement>(".arts_name").innerText,
    file_name = `${albom_title} - ${albom_art}`;

  const zipFile = await zip.generateAsync({ type: "blob" });

  if (stop_function.v) {
    throw new Error("window closed!");
  }

  save_blob_file(zipFile, file_name);
}

async function save_blob_file(blob, file_name) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;

  a.download = file_name || "download";

  document.body.appendChild(a);
  a.click();
  a.remove();
}
