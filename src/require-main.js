import { my_require } from "./my-require";



(async () => {

    const repo = "MusiCode1/jewish-music.fm";

    const version = await get_latest_release_tag_name(repo);

    const url = `https://cdn.jsdelivr.net/gh/${repo}@${version}/build/bundle.js`;


    const app = my_require(url);
})();


async function get_latest_release_tag_name(repo) {

    const res = await fetch(`https://api.github.com/repos/${repo}/releases`);

    const releases = await res.json();

    console.log(releases[0].tag_name);

    return releases[0].tag_name;
}