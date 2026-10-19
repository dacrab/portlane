<script lang="ts">
import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte'
import { enhance } from '$app/forms'
import { confirmDeleteFromEvent } from '$lib/ui/confirm'

let {
	action,
	message,
	id,
	name = 'id',
	ondelete,
}: {
	action: string
	message: string
	id: string | number
	name?: string
	ondelete?: () => void
} = $props()
</script>

<form method="POST" action={action} use:enhance={() => async ({ update }) => { await update(); ondelete?.(); }}>
	<input {name} value={id} type="hidden" />
	<button type="button" class="btn-icon shrink-0" title="Delete"
		onclick={(e: MouseEvent) => confirmDeleteFromEvent(message, e)}>
		<span class="text-faint"><IconTrashRegular class="h-3.5 w-3.5" /></span>
	</button>
</form>
