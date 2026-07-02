import { browser } from '$app/environment';

const initial: boolean = browser ? localStorage.getItem('sidebar_collapsed') === 'true' : false;
let _collapsed = $state(initial);

export const sidebarCollapsed = {
	get value() { return _collapsed; },
	set value(v: boolean) {
		_collapsed = v;
		if (browser) localStorage.setItem('sidebar_collapsed', String(v));
	},
	toggle() {
		_collapsed = !_collapsed;
		if (browser) localStorage.setItem('sidebar_collapsed', String(_collapsed));
	},
};
