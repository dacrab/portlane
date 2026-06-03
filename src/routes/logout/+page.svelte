<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let formEl: HTMLFormElement;
	onMount(() => formEl.requestSubmit());
</script>

<form method="POST" bind:this={formEl} use:enhance class="hidden"></form>
