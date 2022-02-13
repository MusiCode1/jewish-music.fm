
export function my_console_log(txt: string) {

	const my_console = document.querySelector<HTMLElement>("#text");

	console.log(txt);

	my_console.innerText += txt + "\n";

	my_console.scrollTo({
		top: my_console.scrollHeight,
		behavior: "smooth"
	});
}