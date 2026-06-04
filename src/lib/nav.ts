import IconSquaresFourRegular from 'phosphor-icons-svelte/IconSquaresFourRegular.svelte';
import IconSquaresFourBold from 'phosphor-icons-svelte/IconSquaresFourBold.svelte';
import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
import IconFolderOpenBold from 'phosphor-icons-svelte/IconFolderOpenBold.svelte';
import IconFileTextRegular from 'phosphor-icons-svelte/IconFileTextRegular.svelte';
import IconFileTextBold from 'phosphor-icons-svelte/IconFileTextBold.svelte';
import IconUsersRegular from 'phosphor-icons-svelte/IconUsersRegular.svelte';
import IconUsersBold from 'phosphor-icons-svelte/IconUsersBold.svelte';
import IconGearSixRegular from 'phosphor-icons-svelte/IconGearSixRegular.svelte';
import IconGearSixBold from 'phosphor-icons-svelte/IconGearSixBold.svelte';

export interface NavItem {
	href: string;
	label: string;
	labelShort: string;
	R: typeof IconSquaresFourRegular;
	B: typeof IconSquaresFourBold;
}

export const navItems: NavItem[] = [
	{ href: '/dashboard',          label: 'Dashboard', labelShort: 'Home',     R: IconSquaresFourRegular, B: IconSquaresFourBold },
	{ href: '/dashboard/projects', label: 'Projects',  labelShort: 'Projects', R: IconFolderOpenRegular,  B: IconFolderOpenBold },
	{ href: '/dashboard/invoices', label: 'Invoices',  labelShort: 'Invoices', R: IconFileTextRegular,    B: IconFileTextBold },
	{ href: '/dashboard/clients',  label: 'Clients',   labelShort: 'Clients',  R: IconUsersRegular,       B: IconUsersBold },
	{ href: '/dashboard/settings', label: 'Settings',  labelShort: 'Settings', R: IconGearSixRegular,     B: IconGearSixBold },
];
