<script>
	import odds from "$data/odds.csv";
	export let caption;
	export let src;
	export let note;

	const sources = { odds };
</script>

<table>
	{#if caption}
		<caption>{caption}</caption>
	{/if}
	<thead>
		<tr>
			{#each Object.keys(sources[src][0]) as key}
				<th>{key}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each sources[src] as row}
			<tr>
				{#each Object.values(row) as value}
					<td>{@html value}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
{#if note}
	<p><em>Note: {@html note}</em></p>
{/if}

<style>
	table {
		font-family: var(--mono);
	}

	td,
	th {
		padding-right: 16px;
	}

	th:nth-of-type(2),
	td:nth-of-type(2) {
		text-align: right;
	}

	p {
		font-size: var(--14px);
		font-family: var(--mono);
	}
</style>
