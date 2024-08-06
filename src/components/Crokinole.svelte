<script>
	import { onMount } from "svelte";
	import * as T from "three";
	import R from "@dimforge/rapier3d-compat";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";
	import createBoard from "$utils/createBoard.js";
	import * as S from "$data/specs.js";
	import debug from "$utils/debug.js";
	import createHollowCylinderCollider from "$utils/createHollowCylinderCollider.js";

	const fov = 45;
	const ratio = 1;
	const near = 0.1;
	const far = 10;
	const camera = new T.PerspectiveCamera(fov, ratio, near, far);
	const scene = new T.Scene();
	const renderer = new T.WebGLRenderer({ antialias: true });

	let rigidBody;
	let disc;
	let el;
	let offsetWidth;
	let offsetHeight;
	let world;
	let lines = [];

	function flick() {
		const impulse = new T.Vector3(-0.06, 0, 0);
		rigidBody.applyImpulse(impulse, true);
	}

	function createGrid() {
		const size = 1;
		const divisions = 10;
		const g = new T.GridHelper(size, divisions);
		return g;
	}

	function createDisc() {
		// Create the cylinder geometry
		const g = new T.CylinderGeometry(
			S.discRadius,
			S.discRadius,
			S.discHeight,
			S.segments / 3
		);

		// Create the material
		const m = new T.MeshStandardMaterial({ color: 0xffff00 });

		// Create the mesh
		const o = new T.Mesh(g, m);

		o.position.set(S.outerCircleRadius, S.discY, 0);

		return o;
	}

	function tick() {
		world.step();

		const p = rigidBody.translation();
		const r = rigidBody.rotation();

		// Update the Three.js disc position and rotation
		disc.position.set(p.x, p.y, p.z);
		disc.quaternion.set(r.x, r.y, r.z, r.w);

		renderer.render(scene, camera);
		// lines = debug({ scene, world, lines });

		requestAnimationFrame(tick);
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

		disc = createDisc();

		const group = new T.Group();

		const board = createBoard();

		group.add(board);
		group.add(disc);

		scene.add(directionalLight);
		scene.add(ambientLight);
		scene.add(gridHelper);
		scene.add(group);

		const gravity = { x: 0.0, y: -9.81, z: 0.0 };
		world = new R.World(gravity);

		const baseC = new R.ColliderDesc(
			new R.Cylinder(S.baseHeight / 2, S.baseRadius)
		).setTranslation(0, S.baseY, 0);

		world.createCollider(baseC);

		const friction = 0.15;
		const restitution = 0.03;

		const structure = board.children.find((d) => d.name === "structure");
		const surface = structure.children.find((d) => d.name === "surface");
		const surfaceC = createHollowCylinderCollider(surface.geometry)
			.setTranslation(0, S.surfaceY, 0)
			.setFriction(friction)
			.setRestitution(restitution);

		world.createCollider(surfaceC);

		const discC = new R.ColliderDesc(
			new R.Cylinder(S.discHeight / 2, S.discRadius)
		)
			.setFriction(friction)
			.setRestitution(restitution);

		const mass = 0.06;

		const linearDamping = 0;
		const rigidBodyDesc = R.RigidBodyDesc.dynamic()
			.setAdditionalMass(mass)
			.setLinearDamping(linearDamping)
			.setTranslation(S.outerCircleRadius, S.discY * 5, 0)
			.setCcdEnabled(true);

		rigidBody = world.createRigidBody(rigidBodyDesc);

		const collider = world.createCollider(discC, rigidBody);

		tick();
	});
</script>

<div bind:this={el} bind:offsetWidth bind:offsetHeight></div>

<button on:click={flick}>FLICK</button>

<style>
	div {
		max-width: 600px;
		width: 100%;
		aspect-ratio: 1;
		margin: 0 auto;
		background: #000;
	}
</style>
