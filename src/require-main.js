import { my_require } from "./my-require";



(async () => {
    const url = "https://cdn.jsdelivr.net/gh/MusiCode1/jewish-music.fm/public/build/bundle.js";

    const app = my_require(url);
})()