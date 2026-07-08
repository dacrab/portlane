import { toast } from 'svelte-sonner';

/** Format cents to display string e.g. "$3,200" or "$3,200.50" */
export const fmtMoney = (cents: number, currency = 'USD') =>
	(cents / 100).toLocaleString('en-US', { style: 'currency', currency, minimumFractionDigits: cents % 100 === 0 ? 0 : 2 });

/** Format date to short form e.g. "Jun 3" */
export const fmtDate = (iso: string) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Format date to long form e.g. "June 3, 2026" */
export const fmtDateLong = (iso: string) =>
	new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/** Format date+time e.g. "Jun 3, 2:30 PM" */
export const fmtDateTime = (iso: string) =>
	new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Today's ISO date string for overdue comparisons */
export const today = () => new Date().toISOString().split('T')[0]!;

/** Status → badge CSS class */
export const statusBadge: Record<string, string> = {
	draft: 'badge badge-neutral', sent: 'badge badge-blue',
	paid: 'badge badge-green',    overdue: 'badge badge-red',
	planning: 'badge badge-neutral', in_progress: 'badge badge-accent',
	review: 'badge badge-yellow',    completed: 'badge badge-green',
	archived: 'badge badge-neutral',
};

/** Status → human label */
export const statusLabel: Record<string, string> = {
	draft: 'Draft', sent: 'Sent', paid: 'Paid', overdue: 'Overdue',
	in_progress: 'In Progress', review: 'Review',
	planning: 'Planning', completed: 'Completed', archived: 'Archived',
};

/** Download a file via signed URL */
export async function downloadFile(path: string, name: string) {
	const res = await fetch(`/api/file-url?path=${encodeURIComponent(path)}`);
	if (!res.ok) throw new Error('Download failed');
	const { url } = await res.json();
	const a = document.createElement('a');
	a.href = url; a.download = name; a.click();
}

/** Toast-based delete confirmation */
export function confirmDelete(message: string, form: HTMLFormElement) {
	toast('Are you sure?', {
		description: message,
		action: { label: 'Delete', onClick: () => form.requestSubmit() },
		duration: 8000,
	});
}
