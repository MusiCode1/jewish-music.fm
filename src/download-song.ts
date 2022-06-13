import { my_console_log } from "./my-console-log";
import { bytesToSize } from "./bytesToSize";
import { stop_function } from "./globals";
import format from "format-util";
import { lang_text } from "./text";
import type { Song } from "./Song";

export function download_song(song: Song, reply = 0) {
  let res: Promise<Response>;

  const promise = new Promise(async (resolve, reason) => {
    res = fetch(song.url, {
      headers: {
        Range: "bytes=0-",
      },
    });

    const response = await res;

    if (response.status < 200 || response.status >= 400) {
      resolve(null);
    }

    const reader = response.body.getReader();

    const contentLength = response.headers.get("Content-Length");
    let receivedLength = 0;

    const stream = new Response(
      new ReadableStream({
        async start(controller) {
          const interval = setInterval(() => {
            my_console_log(
              format(
                lang_text.download,
                song.file_name,
                bytesToSize(receivedLength),
                bytesToSize(contentLength)
              )
            );
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
        },
      })
    );

    const blob = await stream.blob();

    resolve(blob);
  });

  return promise;
}
