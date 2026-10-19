import { browser } from '$app/environment'

const STORAGE_KEY = 'sidebar_collapsed'
let collapsed = $state(browser && localStorage.getItem(STORAGE_KEY) === 'true')

export const sidebarCollapsed = {
	get value() {
		return collapsed
	},
	set value(v: boolean) {
		collapsed = v
		if (browser) localStorage.setItem(STORAGE_KEY, String(v))
	},
	toggle() {
		this.value = !this.value
	},
}
