export function check() {

    const audio_list = document.querySelectorAll("audio > source");

    if (window.location.hostname != "jewishmusic.fm") {

        throw new Error("זה איננו " + "jewishmusic.fm!");
    }

    if (audio_list.length < 1) {

        throw new Error("אין בדף זה קבצי מוזיקה!");
    }

}