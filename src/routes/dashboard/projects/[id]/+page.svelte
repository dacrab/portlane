<script lang="ts">
import ProjectWorkspace from '#lib/components/ProjectWorkspace.svelte'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()
</script>

<ProjectWorkspace
	project={data.project}
	milestones={data.milestones}
	files={data.files}
	comments={data.comments}
	clients={data.clients}
	timeEntries={data.timeEntries}
	note={data.note}
	role="owner"
	currentUserId={data.user?.userId ?? ''}
/>
