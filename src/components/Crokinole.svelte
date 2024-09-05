<script>
	const DEBUG = false;

	import { onMount } from "svelte";
	import * as T from "three";
	import R from "@dimforge/rapier3d-compat";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";
	import createBoard from "$utils/createBoard.js";
	import * as S from "$data/specs.js";
	import debug from "$utils/debug.js";
	import createHollowCylinderCollider from "$utils/createHollowCylinderCollider.js";
	import { Raycaster, Vector2 } from "three";

	const fov = 45;
	const ratio = 1;
	const near = 0.1;
	const far = 10;
	const camera = new T.PerspectiveCamera(fov, ratio, near, far);
	const scene = new T.Scene();
	const renderer = new T.WebGLRenderer({ antialias: true });

	let el;
	let offsetWidth;
	let offsetHeight;
	let world;

	let xAngle = 0;
	let yAngle = 0;
	let flickAmt = -0.06;
	let discs = [];
	let lines = [];

	let activeDiscIndex = -1; // To keep track of which disc is in play; -1 means no disc is active
	const raycaster = new Raycaster();

	// Use raycaster to get the intersection point of the mouse with the discs
	function onCanvasClick(event) {
		const rect = renderer.domElement.getBoundingClientRect();

		const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(new T.Vector2(x, y), camera);

		const intersects = raycaster.intersectObjects(
			discs.map((d) => d.disc),
			false
		);

		if (intersects.length > 0) {
			const clickedDisc = intersects[0].object;
			const clickedIndex = discs.findIndex((d) => d.disc === clickedDisc);
			setActiveDisc(clickedIndex);
		}
	}

	// A separate mousemove function detects if a disc is hovered, which we use for cursors and highlighting
	function onCanvasMouseMove(event) {
		const rect = renderer.domElement.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		raycaster.setFromCamera(new T.Vector2(x, y), camera);

		const intersects = raycaster.intersectObjects(
			discs.map((d) => d.disc),
			false
		);

		if (intersects.length > 0) {
			renderer.domElement.style.cursor = "pointer";
		} else {
			renderer.domElement.style.cursor = "default";
		}
	}

	function flick() {
		if (activeDiscIndex === -1 || activeDiscIndex >= discs.length) return;

		// const latestDisc = discs[activeDiscIndex];
		// const activeDisc = latestDisc;
		const impulse = new T.Vector3(flickAmt, yAngle, xAngle);
		const activeDisc = discs[activeDiscIndex];
		activeDisc.rigidBody.applyImpulse(impulse, true);
	}

	function reset() {
		discs.forEach(({ disc, rigidBody }) => {
			world.removeRigidBody(rigidBody);
			scene.remove(disc);
		});
		discs = [];
	}

	function createGrid() {
		const size = 1;
		const divisions = 10;
		const g = new T.GridHelper(size, divisions);
		return g;
	}

	function createDisc() {
		const g = new T.CylinderGeometry(
			S.discRadius,
			S.discRadius,
			S.discHeight,
			S.segments / 3
		);

		// FIXME: Which material works best here?
		const m = new T.MeshStandardMaterial({ color: 0xffff00 });

		const o = new T.Mesh(g, m);
		o.position.set(S.outerCircleRadius, S.discY, 0);

		return o;
	}

	function addDisc() {
		const disc = createDisc();
		scene.add(disc);

		const discC = new R.ColliderDesc(
			new R.Cylinder(S.discHeight / 2, S.discRadius)
		)
			.setFriction(0.15)
			.setRestitution(0.03);

		const rigidBodyDesc = R.RigidBodyDesc.dynamic()
			.setAdditionalMass(0.06)
			.setLinearDamping(0)
			.setTranslation(S.outerCircleRadius, S.discY * 5, 0)
			.setCcdEnabled(true);

		const rigidBody = world.createRigidBody(rigidBodyDesc);
		const collider = world.createCollider(discC, rigidBody);

		const discIndex = discs.length;

		discs.push({ disc, rigidBody });

		// Make the disc active
		setActiveDisc(discIndex);
	}

	function setActiveDisc(index) {
		activeDiscIndex = index;
		updateDiscHighlights();
	}

	// FIXME: Better treatment for highlighted disc.
	function updateDiscHighlights() {
		discs.forEach(({ disc }, index) => {
			if (index === activeDiscIndex) {
				disc.material.emissive.setHex(0xff0000);
			} else {
				disc.material.emissive.setHex(0x000000);
			}
		});
	}

	let showGameOver = false;
	function tick() {
		world.step();

		discs.forEach(({ disc, rigidBody }) => {
			const p = rigidBody.translation();
			const r = rigidBody.rotation();

			disc.position.set(p.x, p.y, p.z);
			disc.quaternion.set(r.x, r.y, r.z, r.w);
		});

		// FIXME: Game probably shouldn't end if any disc is off the board... maybe if all of them are
		discs.forEach(({ rigidBody }) => {
			if (isDiscOffBoard(rigidBody)) {
				showGameOver = true;
			}
		});

		renderer.render(scene, camera);

		if (DEBUG) {
			lines = debug({ scene, world, lines });
		}

		requestAnimationFrame(tick);
	}

	function isDiscOffBoard(rigidBody) {
		const p = rigidBody.translation();
		const distanceFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);

		// Check if the disc is below the board or outside its radius
		return distanceFromCenter > S.baseRadius;
	}

	$: if (offsetWidth && offsetHeight) {
		camera.aspect = offsetWidth / offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(offsetWidth, offsetHeight);
	}

	onMount(async () => {
		await R.init();

		camera.position.set(0.7, 0.5, 0);
		el.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		const directionalLight = new T.DirectionalLight(0xffffff, 1);
		const ambientLight = new T.AmbientLight(0xffffff, 0.5);
		const gridHelper = createGrid();

		const group = new T.Group();

		const board = createBoard();

		group.add(board);

		scene.add(directionalLight);
		scene.add(ambientLight);
		scene.add(gridHelper);
		scene.add(group);

		const gravity = { x: 0.0, y: -9.81, z: 0.0 };
		world = new R.World(gravity);

		const structure = board.children.find((d) => d.name === "structure");
		const surface = structure.children.filter((d) => d.name === "surface");
		const rim = structure.children.filter((d) => d.name === "rim");
		const hollowCylinders = [...surface, ...rim];

		hollowCylinders.forEach(function (shape) {
			const target = new T.Vector3();
			shape.getWorldPosition(target);

			const hollowShapeCollider = createHollowCylinderCollider(shape)
				.setTranslation(target.x, target.y, target.z)
				.setFriction(0.15)
				.setRestitution(0.05);

			world.createCollider(hollowShapeCollider);
		});

		const base = structure.children.filter((d) => d.name === "base");
		const pegs = structure.children
			.filter((d) => d.name === "pegs")
			.map((d) => d.children.filter((d) => d.name === "peg"))
			.reduce((result, curr) => [...result, ...curr], []);
		const cylinders = [...base, ...pegs];

		cylinders.forEach(function (shape) {
			const target = new T.Vector3();
			shape.getWorldPosition(target);

			const cylinderShapeCollider = new R.ColliderDesc(
				new R.Cylinder(
					shape.geometry.parameters.height,
					shape.geometry.parameters.radiusTop
				)
			)
				.setTranslation(target.x, target.y, target.z)
				.setRestitution(1);

			world.createCollider(cylinderShapeCollider);
		});

		tick();
	});
</script>

<main>
	<div
		class="canvas-container"
		bind:this={el}
		bind:offsetWidth
		bind:offsetHeight
		on:click={onCanvasClick}
		on:mousemove={onCanvasMouseMove}
	></div>

	{#if showGameOver}
		<div class="screen-overlay"></div>
		<div class="modal">
			Game Over
			<button
				on:click={() => {
					reset();
					showGameOver = false;
				}}>Play Again</button
			>
		</div>
	{/if}

	<div style="display: flex; flex-direction: row; gap: 8px;">
		<div style="display: flex; flex-direction: column; gap: 8px;">
			<label for="xAngle">X Angle {xAngle}</label>
			<input
				type="range"
				min="-0.1"
				max="0.1"
				step="0.01"
				bind:value={xAngle}
			/>
		</div>

		<div style="display: flex; flex-direction: column; gap: 8px;">
			<label for="yAngle">Y Angle {yAngle}</label>
			<input type="range" min="0" max=".2" step="0.01" bind:value={yAngle} />
		</div>

		<div style="display: flex; flex-direction: column; gap: 8px;">
			<label for="flickAmt">Flick Amt {flickAmt}</label>
			<input type="range" min="-.3" max="0" step="0.01" bind:value={flickAmt} />
		</div>

		<button on:click={flick}>FLICK</button>
		<button on:click={reset}>RESET</button>
		<button on:click={addDisc}>ADD DISC</button>
	</div>
</main>

<style>
	main {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 12px;
	}
	.canvas-container {
		max-width: 600px;
		width: 100%;
		aspect-ratio: 1;
		margin: 0 auto;
		background: #000;
	}

	.modal {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		padding: 20px;
		border-radius: 5px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		z-index: 20;
	}

	.screen-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 10;
	}
</style>
