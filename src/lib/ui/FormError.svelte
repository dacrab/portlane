<script lang="ts">
let { message }: { message?: string } = $props()
</script>

{#if message}
	<p class="rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-[13px] text-danger">
		{message}
	</p>
{/if}
