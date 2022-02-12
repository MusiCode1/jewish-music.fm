
export function my_console_log(txt: string) {

	console.log(txt);

	const my_console = document.querySelector<HTMLElement>("#text");

	my_console.innerText += txt + "\n";

	my_console.scrollTo({
		top: my_console.scrollHeight,
		behavior: "smooth"
	});
}