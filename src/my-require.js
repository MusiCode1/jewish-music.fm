
export async function my_require(url) {

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;


    document.head.appendChild(script);

    await new Promise((resolve) => script.onload = resolve);
};

