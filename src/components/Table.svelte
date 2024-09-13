<script>
	import odds from "$data/odds.csv";
	import competitive from "$data/competitive.csv";
	export let caption;
	export let src;
	export let note;
	export let right;
	export let highlight;

	const sources = { odds, competitive };

	$: rights = right.split(",").map(Number) || [];
	$: highlights = highlight.split(",").map(Number) || [];
</script>

<div class="c">
	<table>
		{#if caption}
			<caption><strong>{caption}</strong></caption>
		{/if}
		<thead>
			<tr>
				{#each Object.keys(sources[src][0]) as key, i}
					{@const right = rights.includes(i)}
					<th class:right>{key}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sources[src] as row, i}
				{@const h = highlights.includes(i)}
				<tr class:h>
					{#each Object.values(row) as value, j}
						{@const r = rights.includes(j)}
						<td class:r>{@html value}</td>
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
		font-size: var(--14px);
	}

	td {
		border: 1px solid var(--color-gray-300);
	}

	th.r,
	td.r {
		text-align: right;
	}

	tr.h {
		background-color: var(--color-bg2);
		font-weight: bold;
	}

	caption {
		font-size: var(--24px);
		font-family: var(--serif);
	}

	p {
		font-size: var(--14px);
	}
</style>
