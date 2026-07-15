<script lang="ts">
import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte'
import { onMount, untrack } from 'svelte'
import { toast } from 'svelte-sonner'
import Avatar from '$lib/components/Avatar.svelte'
import SectionHeader from '$lib/components/SectionHeader.svelte'
import type { Database } from '$lib/database.types'
import { supabase } from '$lib/supabase'

type Comment = Database['public']['Tables']['comments']['Row'] & {
	profiles: { full_name: string | null } | null
}

let {
	projectId,
	userId,
	initial = [],
}: {
	projectId: string
	userId: string | undefined
	initial?: Comment[]
} = $props()

let comments = $state<Comment[]>(untrack(() => initial))

onMount(() => {
	const channel = supabase
		.channel(`comments:${projectId}`)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'comments',
				filter: `project_id=eq.${projectId}`,
			},
			async (payload) => {
				const { data: row } = await supabase
					.from('comments')
					.select('*, profiles(full_name)')
					.eq('id', payload.new.id)
					.single()
				if (row) {
					comments = [...comments, row]
					if (row.author_id !== userId)
						toast.info(
							`New message from ${row.profiles?.full_name ?? 'someone'}`,
						)
				}
			},
		)
		.subscribe()
	return () => {
		supabase.removeChannel(channel)
	}
})
</script>

<SectionHeader title="Messages" icon={IconChatTextRegular} count={comments.length || undefined} />
{#if comments.length > 0}
	<div class="space-y-3 mb-4 max-h-80 overflow-y-auto">
		{#each comments as c (c.id)}
			{@const isMe = c.author_id === userId}
			<div class="flex items-start gap-2.5" class:flex-row-reverse={isMe}>
				<Avatar name={c.profiles?.full_name ?? '?'} size={7} />
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
