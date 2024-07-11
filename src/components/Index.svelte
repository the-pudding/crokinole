<script>
	import { browser } from "$app/environment";
	import Crokinole from "$components/Crokinole.svelte";
</script>

{#if browser}
	<Crokinole />
{/if}
