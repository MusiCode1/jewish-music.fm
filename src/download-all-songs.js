
import { progress_max, progress_val } from './globals';
import format from "format-util";
import { text } from "./text";
//import JSZip from "jszip";
import { my_require } from "./my-require";

export async function download_all_songs() {

	await my_require("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.6.0/jszip.min.js");

	const audio_list = document.querySelectorAll("audio > source");


	let zip = new window.JSZip();

	progress_max.set(audio_list.length);

	let i = 0;

	for (const source of audio_list) {

		let url = source.src.replace("http://", "https://");

		const file_name = url.split("/").pop();

		my_console_log(
			format(text.is_download_file, file_name)
		);

		const blob = await download_file(url);

		my_console_log(
			format(text.zipping_file, file_name)
		);

		zip.file(file_name, blob, { binary: true });

		i++;

		progress_val.set(i);
	}

	my_console_log(
		format(text.ready)
	);

	await save_zip_file(zip);

}

async function save_zip_file(zip) {

	const albom_title = document.querySelector(".album-title").innerText,
		albom_art = document.querySelector(".arts_name").innerText,
		file_name = `${albom_title} - ${albom_art}`;

	const zipFile = await zip.generateAsync({ type: "blob" });

	save_blob_file(zipFile, file_name);
}

function download_file(url, reply = 0) {

	let res;

	const promise = new Promise(async (resolve, reason) => {

		const file_name = url.split("/").pop();

		res = fetch(url, {
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
				resolve(download_file(url, reply))
			} else {
				reason();
				throw response;
			}
		}

		const reader = response.body.getReader();

		const contentLength = response.headers.get('Content-Length');
		let receivedLength = 0;

		const stream = new Response(
			new ReadableStream({
				async start(controller) {

					const interval = setInterval(() => {
						my_console_log(
							format(text.download,
								file_name,
								bytesToSize(receivedLength),
								bytesToSize(contentLength)
							)
						);
					}, 1000);

					while (true) {
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
			})
		);

		const blob = await stream.blob();

		resolve(blob);
	});

	promise.res = res;

	return promise;
}

function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Byte';

	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
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

function my_console_log(txt) {

	console.log(txt);

	const my_console = document.querySelector("#text");

	my_console.innerText += txt + "\n";

	my_console.scrollTo({
		top: my_console.scrollHeight,
		behavior: "smooth"
	});
}
