<script>
	import { format, sum, max } from "d3";
	export let note;
	import misses from "$data/misses.csv";

	const raw = misses.map(({ bin, count }) => ({ bin: +bin, count: +count }));
	const total = sum(raw, (d) => d.count);
	const maximum = max(raw, (d) => d.count);
	const data = raw.map((d) => ({ ...d, percent: d.count / total }));
</script>

<div class="c">
	<div class="chart">
		<div class="bins">
			{#each data as { bin, count, percent }, i}
				{@const height = `${Math.round((count / maximum) * 100)}%`}
				{@const label = bin === 17 ? "&nbsp;" : bin}
				<div class="bin">
					<div class="bar" style:height>
						<p class="percent" class:hide={percent < 0.03}>
							{format(".0%")(percent).replace(i > 0 ? "%" : "", "")}
						</p>
					</div>
					<p class="label"><strong>{@html label}</strong></p>
				</div>
			{/each}
		</div>
		<div class="annotation">
			<p>
				<strong>Double perfect round</strong>
				<br />
				No misses<br />&darr;
			</p>
		</div>
	</div>

	<p class="note">
		<em>Note: {@html note}</em>
	</p>
</div>

<style>
	.c {
		font-family: var(--sans);
	}

	.chart {
		position: relative;
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
		position: relative;
	}

	.label,
	.percent {
		text-align: center;
		font-size: var(--14px);
		margin: 0;
	}

	.percent {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, -100%);
	}

	.annotation {
		position: absolute;
		bottom: 32px;
		right: 0;
	}

	.annotation p {
		margin: 0;
		font-size: var(--14px);
		text-align: right;
	}

	.hide {
		display: none;
	}

	.note {
		font-size: var(--14px);
	}

	@media only screen and (max-width: 640px) {
		.label,
		.percent {
			font-size: var(--12px);
		}
	}
</style>
