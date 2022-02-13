
import { download_all_songs } from "./download-all-songs";
import { my_require } from "./my-require";
import { add_html } from "./html";
import { close } from "./close";
import { check } from "./check";

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

	} catch (error) {

		if (error.massage === "window closed!") {

			console.log(error.massage);
			throw error;

		} else {

			alert(error);
			close();
			throw error;
		}
	}

})();



