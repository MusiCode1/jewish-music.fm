import { stop_function } from "./globals";

window.close = close;


export function close() {

    const app = document.querySelector<HTMLElement>("#window");

    stop_function.v = true;

    app.style.opacity = "0";
    app.style.visibility = "hidden";

    setTimeout(() => {
        app.remove();
    }, 3 * 1000);
}