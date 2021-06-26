import { my_require } from "./my-require";

const url = `https://cdn.jsdelivr.net/gh/MusiCode1/jewish-music.fm@latest/public/build/bundle.js`;

(async () => {
    

    const app = my_require(url);
})();