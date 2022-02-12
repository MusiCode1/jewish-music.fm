import { opacity, visibility, stop_function } from "./globals";
import app_div from "./app_element";

export function close() {

    stop_function.v = true;

    opacity.set(0);
    visibility.set("hidden");

    setTimeout(() => {
        app_div.remove();
    }, 3 * 1000);
}