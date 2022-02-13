import { stop_function } from "./globals";

export function close() {

    const app = document.querySelector<HTMLElement>(".download_from_jewish_music");

    stop_function.v = true;

    app.style.opacity = "0";
    app.style.visibility = "hidden";

    console.log("close window...");
    

    setTimeout(() => {
        app.remove();
    }, 3 * 1000);
}