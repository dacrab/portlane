<script lang="ts">
import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte'
import { toast } from 'svelte-sonner'
import { asRecord } from '#lib/records.js'
import { confirmDeleteFromEvent } from '#lib/ui/confirm.js'
import IconButton from '#lib/ui/IconButton.svelte'
import { enhance } from '$app/forms'

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

<form
	method="POST"
	{action}
	use:enhance={() => async ({ result, update }) => {
		await update()
		if (result.type === 'success') {
			ondelete?.()
			return
		}
		if (result.type === 'failure') {
			const error = asRecord(result.data)?.error
			toast.error(typeof error === 'string' ? error : 'Delete failed')
		} else if (result.type === 'error') {
			toast.error('Something went wrong')
		}
	}}
>
	<input {name} value={id} type="hidden" />
	<IconButton
		label="Delete"
		onclick={(event: MouseEvent) => confirmDeleteFromEvent(message, event)}
	>
		<IconTrashRegular class="h-4 w-4" />
	</IconButton>
</form>
