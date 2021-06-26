
import { tweened } from 'svelte/motion';
import { writable } from "svelte/store"

export const progress_val = tweened(0);

export const progress_max = writable(0);

export const opacity = writable(1);

export const visibility = writable("visible");

export let stop_function = {
    v: false
};
window.s = stop_function;