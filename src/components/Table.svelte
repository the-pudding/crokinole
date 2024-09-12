<script>
	import odds from "$data/odds.csv";
	import competitive from "$data/competitive.csv";
	export let caption;
	export let src;
	export let note;
	export let right;

	const sources = { odds, competitive };

	$: alignRight = right.split(",").map(Number) || [];
</script>

<div class="c">
	<table>
		{#if caption}
			<caption><strong>{caption}</strong></caption>
		{/if}
		<thead>
			<tr>
				{#each Object.keys(sources[src][0]) as key, i}
					{@const right = alignRight.includes(i)}
					<th class:right>{key}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sources[src] as row}
				<tr>
					{#each Object.values(row) as value, i}
						{@const right = alignRight.includes(i)}
						<td class:right>{@html value}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	{#if note}
		<p><em>Note: {@html note}</em></p>
	{/if}
</div>

<style>
	.c {
		font-family: var(--sans);
		margin: 32px 0;
	}

	td,
	th {
		padding: 8px 16px;
		font-size: var(--16px);
	}

	td {
		border: 1px solid var(--color-gray-300);
	}

	th.right,
	td.right {
		text-align: right;
	}

	caption {
		font-size: var(--24px);
	}

	p {
		font-size: var(--14px);
	}
</style>
