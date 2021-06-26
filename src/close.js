
import app_div from "./app_element";

export function close() {

    document.querySelector("#window").style.opacity = 0;
    document.querySelector("#window").style.visibility = "hidden";

    setTimeout(()=>{
        app_div.remove();
    }, 3 * 1000);

    
}