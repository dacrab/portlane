/** Format cents to display string e.g. "$3,200.00" */
export const fmtMoney = (cents: number, currency = 'USD') =>
	`${currency} ${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

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
