<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";

	/*
		Overall playing surface diameter: 26” (13” / ~330mm radius)
		Outer circle diameter: 24” (12” / ~305mm radius)
		Middle circle diameter: 16” (8” / ~203mm radius)
		Inner circle diameter: 8” (4” / ~102mm radius)
		Ditch: 2” (~51mm) minimum
		20 hole diameter: 1 3/8” (35mm)
		20 hole depth: 1/4” (6mm)
		Dividing circle lines: 1/16” (1.5mm) to 1/8” (3mm)
		Discs: 1 1/4” x 3/8” diameter (32mm x 10mm) Standard Crokinole discs
		Rim: 1 1/2” (1/2”/12mm taller than the playing surface)
		Playing surface: 1/2” thickness on most boards.
		Peg Diameter: 3/8”
	*/

	const mm = 0.001;
	const surfaceRadius = 0.3302;
	const holeRadius = 0.0175;
	const surfaceHeight = 0.0127;
	const ditchWidth = 0.051;
	const rimWidth = 0.00635;
	const rimHeight = 0.0381;
	const baseHeight = surfaceHeight / 2;
	const baseRadius = surfaceRadius + ditchWidth;
	const pegRadius = 0.0047625;
	const pegHeight = 0.0127;
	const innerCircleRadius = 0.102;
	const middleCircleRadius = 0.2032;
	const outerCircleRadius = 0.305;
	const discRadius = 0.015;
	const discHeight = 0.01;

	const edges = 96;

	let el;
	let offsetWidth;
	let offsetHeight;

	function cylinderLathe(outerR, innerR, h) {
		// positionally it starts at top (cylinder is middle)
		const halfH = h * 0.5;

		const points = [
			new THREE.Vector2(innerR, -halfH),
			new THREE.Vector2(outerR, -halfH),
			new THREE.Vector2(outerR, halfH),
			new THREE.Vector2(innerR, halfH),
			new THREE.Vector2(innerR, -halfH)
		];

		const g = new THREE.LatheGeometry(points, edges);

		return g;
	}

	function createGrid() {
		const size = 1;
		const divisions = 10;
		const g = new THREE.GridHelper(size, divisions);
		return g;
	}

	function createBase() {
		const g = new THREE.CylinderGeometry(
			baseRadius,
			baseRadius,
			baseHeight,
			edges
		);

		const m = new THREE.MeshStandardMaterial({
			color: 0xff4488,
			flatShading: true
		});

		const o = new THREE.Mesh(g, m);
		o.position.set(0, baseHeight / 2, 0);
		return o;
	}

	function createRim() {
		const g = cylinderLathe(baseRadius + rimWidth, baseRadius, rimHeight);
		const m = new THREE.MeshStandardMaterial({
			color: 0xff88ff,
			flatShading: true
		});
		const o = new THREE.Mesh(g, m);
		o.position.set(0, rimHeight / 2, 0);
		return o;
	}

	function createSurface() {
		const g = cylinderLathe(surfaceRadius, holeRadius, surfaceHeight);
		const m = new THREE.MeshStandardMaterial({
			color: 0x4488ff,
			flatShading: true
		});
		const o = new THREE.Mesh(g, m);
		o.position.set(0, surfaceHeight / 2 + baseHeight, 0);
		return o;
	}

	function createPeg() {
		const g = new THREE.CylinderGeometry(pegRadius, pegRadius, pegHeight, 32);
		const m = new THREE.MeshStandardMaterial({ color: 0x88ff44 });
		const o = new THREE.Mesh(g, m);
		return o;
	}

	function createPegs() {
		const pegs = new THREE.Group();
		for (let i = 0; i < 8; i++) {
			const angle = 3 / 8 + (i / 8) * Math.PI * 2;
			const x = Math.cos(angle) * innerCircleRadius;
			const z = Math.sin(angle) * innerCircleRadius;
			const peg = createPeg();
			peg.position.set(x, 0, z);
			pegs.add(peg);
		}
		pegs.position.set(0, pegHeight / 2 + baseHeight + surfaceHeight, 0);
		return pegs;
	}

	function createCircleLine(r) {
		const geometry = new THREE.CircleGeometry(r, 64);
		const edges = new THREE.EdgesGeometry(geometry);
		const material = new THREE.LineBasicMaterial({ color: 0x000000 });
		const circle = new THREE.LineSegments(edges, material);
		circle.rotation.x = Math.PI / 2;
		circle.position.set(0, baseHeight + surfaceHeight + mm, 0);
		return circle;
	}

	function createQuadrantLines(innerR, outerR) {
		const lines = new THREE.Group();
		const material = new THREE.LineBasicMaterial({ color: 0x000000 });
		for (let i = 0; i < 4; i++) {
			const angle = 3 / 4 + (i / 4) * Math.PI * 2;
			const x1 = Math.cos(angle) * innerR;
			const z1 = Math.sin(angle) * innerR;
			const x2 = Math.cos(angle) * outerR;
			const z2 = Math.sin(angle) * outerR;
			const geometry = new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(x1, 0, z1),
				new THREE.Vector3(x2, 0, z2)
			]);
			const line = new THREE.Line(geometry, material);
			lines.add(line);
		}
		lines.position.set(0, baseHeight + surfaceHeight + mm, 0);
		return lines;
	}

	function createDisc() {
		// Create the cylinder geometry
		const g = new THREE.CylinderGeometry(
			discRadius,
			discRadius,
			discHeight,
			32
		);

		// Create the material
		const m = new THREE.MeshStandardMaterial({ color: 0xffff00 });

		// Create the mesh
		const o = new THREE.Mesh(g, m);

		o.position.set(
			outerCircleRadius,
			baseHeight + surfaceHeight + discHeight / 2,
			0
		);

		return o;
	}

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			40,
			offsetWidth / offsetHeight,
			0.1,
			10
		);
		camera.position.set(1.1, 0.8, 0);
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(offsetWidth, offsetHeight);
		el.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);
		const light = new THREE.DirectionalLight(0xffffff, 1);
		const gridHelper = createGrid();

		const surfaceObject = createSurface();
		const baseObject = createBase();
		const rimObject = createRim();
		const pegGroup = createPegs();
		const innerCircle = createCircleLine(innerCircleRadius);
		const middleCircle = createCircleLine(middleCircleRadius);
		const outerCircle = createCircleLine(outerCircleRadius);
		const perpendicularLines = createQuadrantLines(
			middleCircleRadius,
			outerCircleRadius
		);
		const disc = createDisc();

		const group = new THREE.Group();
		group.add(baseObject);
		group.add(rimObject);
		group.add(surfaceObject);
		group.add(pegGroup);
		group.add(innerCircle);
		group.add(middleCircle);
		group.add(outerCircle);
		group.add(perpendicularLines);
		group.add(disc);

		scene.add(group);
		scene.add(light);
		scene.add(gridHelper);
		scene.add(new THREE.AmbientLight(0xffffff, 0.5));

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});
	});
</script>

<div bind:this={el} bind:offsetWidth bind:offsetHeight></div>

<style>
	div {
		max-width: 600px;
		width: 100%;
		aspect-ratio: 1;
		margin: 0 auto;
		background: #000;
	}
</style>
