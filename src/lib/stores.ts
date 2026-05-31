import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const stored = browser ? localStorage.getItem('sidebar_collapsed') === 'true' : false;
export const sidebarCollapsed = writable(stored);

if (browser) {
	sidebarCollapsed.subscribe(v => localStorage.setItem('sidebar_collapsed', String(v)));
}
