
import { download_all_songs } from "./download-all-songs";
import { my_require } from "./my-require";
import app_div from "./app_element";
import { close } from "./close";
import { check } from "./check";
import App from "./App.svelte";

(async () => {
	try {

		console.log("Musicode7");
		console.log("https://github.com/MusiCode1/jewish-music.fm");

		check();

		await my_require("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");

		new App({
			target: app_div
		});

		download_all_songs().finally(() => {

			close();
		});

	} catch (error) {

		if (error.massage === "window closed!") {

			console.log(error.massage);
			throw error;

		} else {

			alert(error);
			throw error;
		}
	}

})();



