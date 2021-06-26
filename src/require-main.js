import { my_require } from "./my-require";

const version = "0.0.4";

(async () => {
    const url = `https://cdn.jsdelivr.net/gh/MusiCode1/jewish-music.fm@${version}/public/build/bundle.js`;

    const app = my_require(url);
})()