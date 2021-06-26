
import { download_all_songs } from "./download-all-songs";
import app_div from "./app_element";
import { close } from "./close";
import { check } from "./check";
import App from "./App.svelte";

(window.app = async () => {
	try {

		console.log("Musicode7");
		console.log("https://gist.github.com/MusiCode1/c50432ad3f413a958e6f3aea7c214cfc");

		check();

		new App({
			target: app_div
		});

		download_all_songs().finally(() => {

			close();
		});

	} catch (error) {

		alert(error);
		throw error;
	}

})();



