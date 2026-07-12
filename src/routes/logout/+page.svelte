<script lang="ts">
import { onMount } from 'svelte'
import { enhance } from '$app/forms'

let formEl: HTMLFormElement
onMount(() => formEl.requestSubmit())
</script>

<form method="POST" bind:this={formEl} use:enhance class="hidden"></form>
