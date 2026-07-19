<script lang="ts">
import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte'
import Avatar from '$lib/components/Avatar.svelte'
import SectionHeader from '$lib/components/SectionHeader.svelte'

type Comment = {
	id: string
	body: string
	created_at: string
	author_id: string
	name: string | null
}

let {
	userId,
	initial = [],
}: {
	userId: string | undefined
	initial?: Comment[]
} = $props()

let comments = $derived(initial)
</script>

<SectionHeader title="Messages" icon={IconChatTextRegular} count={comments.length || undefined} />
{#if comments.length > 0}
	<div class="space-y-3 mb-4 max-h-80 overflow-y-auto">
		{#each comments as c (c.id)}
			{@const isMe = c.author_id === userId}
			<div class="flex items-start gap-2.5" class:flex-row-reverse={isMe}>
				<Avatar name={c.name ?? '?'} size={7} />
				<div class="rounded-lg px-3 py-2.5 max-w-[85%]"
					style="background:{isMe ? 'var(--color-accent-50)' : 'var(--color-bg)'}">
					<p class="text-sm" style="color:{isMe ? 'var(--color-accent-700)' : 'var(--color-text)'}">{c.body}</p>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p class="mb-4 text-sm text-faint">No messages yet.</p>
{/if}
