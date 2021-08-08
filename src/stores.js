import { writable } from 'svelte/store';

export const taskCount = writable(1);
export const allTasks = writable([]);