
import { my_require } from "./my-require";

(async () => {

    const repo = "MusiCode1/jewish-music.fm";

    const version = "";

    const url = `https://cdn.jsdelivr.net/gh/${repo}@${version}/build/bundle.js`;
        //"http://localhost:5000/build/bundle.js?1";


    const app = my_require(url);
})();