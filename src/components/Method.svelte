<script>
	export let text;
</script>

<div id="method" class="c">
	<h2>Data and Methods</h2>
	{#each text as { value }}
		<p>{@html value}</p>
	{/each}
</div>
