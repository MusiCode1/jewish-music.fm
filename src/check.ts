import { lang_text } from "./text";

export function check() {

    const audio_list = document.querySelectorAll("audio > source");

    if (window.location.hostname !== "jewishmusic.fm") {

        throw new Error(lang_text.is_not_site);
    }

    if (audio_list.length < 1) {

        throw new Error(lang_text.empty_audio);
    }

}