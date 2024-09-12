<script>
	import { format, sum, max } from "d3";
	export let caption;
	import misses from "$data/misses.csv";

	const raw = misses.map(({ bin, count }) => ({ bin: +bin, count: +count }));
	const total = sum(raw, (d) => d.count);
	const maximum = max(raw, (d) => d.count);
	const data = raw.map((d) => ({ ...d, percent: d.count / total }));
</script>

<div>
	<p><strong>{caption}</strong></p>
	<div class="chart">
		<!-- css histogram -->
		<div class="bins">
			{#each data as { bin, count, percent }}
				{@const height = format("%")(count / maximum)}
				{@const label = bin === 17 ? "None" : bin}
				<div class="bin">
					<p class="percent" class:hide={percent < 0.03}>
						{format(".0%")(percent)}
					</p>
					<div class="bar" style:height />
					<p class="label">{label}</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	div {
		font-family: var(--sans);
	}

	p {
		font-size: var(--18px);
	}

	.bins {
		aspect-ratio: 1.5;
		display: flex;
	}

	.bin {
		flex: 1;
		display: flex;
		height: 100%;
		justify-content: flex-end;
		flex-direction: column;
	}

	.bar {
		background: var(--color-fg);
		border: 1px solid var(--color-bg);
		width: 100%;
	}

	.label,
	.percent {
		text-align: center;
		font-size: var(--14px);
		margin: 0;
	}

	.percent {
	}

	.hide {
		display: none;
	}
</style>
