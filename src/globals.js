
import { tweened } from 'svelte/motion';
import { writable } from "svelte/store"

export const progress_val = tweened(0);

export const progress_max = writable(0);