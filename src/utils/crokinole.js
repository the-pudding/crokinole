import Matter from "matter-js";
import * as S from "$data/specs.js";

const DISC_CATEGORY = 0x0001;
const PEG_CATEGORY = 0x0002;
const TRAP_CATEGORY = 0x0004;
const RIM_CATEGORY = 0x0008;
const SURFACE_CATEGORY = 0x0010;
const DISC_RESTITUTION = 0.9;
const DISC_DENSITY = 0.05;
const DISC_FRICTIONAIR = 0.05;

const COLOR = {
	line: "#666",
	disc: "#000",
	board: "#fff",
	shadow: "#eee",
	active: "#f00"
};

let engine;
let world;
let runner;
let render;

let discs = [];
// let trap = [];

let mid;

let activeDisc;
let mousePosition;
let vector;

// TODO move private vs public
export function addDisc(opts = {}) {
	const x = opts.x || mid;
	const y = opts.y || mid + mid * S.five;
	const r = mid * S.disc;
	const density = DISC_DENSITY;
	const restitution = DISC_RESTITUTION;
	const frictionAir = DISC_FRICTIONAIR;

	const disc = Matter.Bodies.circle(
		x,
		y,
		r,
		{
			density,
			restitution,
			frictionAir,
			render: { fillStyle: COLOR.disc },
			label: "disc",
			collisionFilter: {
				category: DISC_CATEGORY,
				mask: DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY
			}
		},
		64
	);

	discs.push(disc);
	Matter.World.add(world, disc);
	activeDisc = disc;
}

function updateDiscColors() {
	discs.forEach((d) => {
		d.render.fillStyle = d.id === activeDisc.id ? COLOR.active : COLOR.disc;
	});
}

export function select({ x, y }) {
	const clickedDiscs = Matter.Query.point(discs, { x, y });

	if (clickedDiscs.length > 0) {
		activeDisc = clickedDiscs[0];
		updateDiscColors();
	}
}

export function drag({ x, y }) {
	vector = {
		x: mousePosition.x - activeDisc.position.x,
		y: mousePosition.y - activeDisc.position.y
	};

	// Cap the vector length for max power
	const maxDragLength = mid * 0.25;
	const maxSpeed = activeDisc.mass * half * 0.0005;

	// Calculate the current vector length
	const currentVectorLength = Matter.Vector.magnitude(vector);

	// Limit the vector length to the maximum drag length
	const clampedVectorLength = Math.min(currentVectorLength, maxDragLength);

	// update vector based on clamped vector length
	vector = Matter.Vector.mult(
		Matter.Vector.normalise(vector),
		clampedVectorLength
	);
}

export function release() {
	const maxSpeed = activeDisc.mass * half * 0.0005;
	const maxDragLength = width * 0.1;
	// const forceMagnitude = maxSpeed * 1;

	const speed = (Matter.Vector.magnitude(vector) / maxDragLength) * maxSpeed;

	// Apply the scaled speed to the normalized vector (direction)
	const force = Matter.Vector.mult(Matter.Vector.normalise(vector), speed);

	// Apply force to active disc based on the vector
	// const force = Matter.Vector.mult(
	// 	Matter.Vector.normalise(vector),
	// 	Matter.Vector.magnitude(vector) / maxSpeed
	// );

	// Scale the speed proportionally to the vector length

	Matter.Body.applyForce(activeDisc, activeDisc.position, force);
}

function createZones() {
	const zone20 = Matter.Bodies.circle(
		mid,
		mid,
		mid * S.twenty,
		{
			isStatic: true,
			isSensor: true,
			render: {
				fillStyle: COLOR.shadow,
				strokeStyle: COLOR.line,
				lineWidth: 2
			},
			label: "20"
		},
		64
	);

	const zone15 = Matter.Bodies.circle(
		mid,
		mid,
		mid * S.fifteen,
		{
			isStatic: true,
			isSensor: true,
			render: {
				fillStyle: COLOR.board,
				strokeStyle: COLOR.line,
				lineWidth: 2
			},
			label: "15"
		},
		64
	);

	const zone10 = Matter.Bodies.circle(
		mid,
		mid,
		mid * S.ten,
		{
			isStatic: true,
			isSensor: true,
			render: {
				fillStyle: COLOR.board,
				strokeStyle: COLOR.line,
				lineWidth: 2
			},
			label: "10"
		},
		64
	);

	const zone5 = Matter.Bodies.circle(
		mid,
		mid,
		mid * S.five,
		{
			isStatic: true,
			isSensor: true,
			render: {
				fillStyle: COLOR.board,
				strokeStyle: COLOR.line,
				lineWidth: 2
			},
			label: "5"
		},
		64
	);

	const zoneSurface = Matter.Bodies.circle(
		mid,
		mid,
		mid * S.surface,
		{
			isStatic: true,
			isSensor: true,
			render: {
				fillStyle: COLOR.board,
				strokeStyle: COLOR.line,
				lineWidth: 2
			},
			label: "surface"
		},
		64
	);

	const zoneBase = Matter.Bodies.circle(
		mid,
		mid,
		mid * S.base,
		{
			isStatic: true,
			isSensor: true,
			render: {
				fillStyle: COLOR.shadow,
				strokeStyle: COLOR.line,
				lineWidth: S.rimWidth * mid
			},
			label: "base"
		},
		64
	);

	Matter.World.add(world, [
		zoneBase,
		zoneSurface,
		zone5,
		zone10,
		zone15,
		zone20
	]);
}

function createTrap20() {
	const wallCount = 16;
	const wallThickness = Math.max(2, mid * 0.02);
	const wallRadius = S.twenty * mid + wallThickness / 2;

	const trap = [];

	for (let i = 0; i < wallCount; i++) {
		// Calculate angle for each wall
		const angle = (i / wallCount) * 2 * Math.PI;

		// Calculate the wall position around the center
		const wallX = mid + Math.cos(angle) * wallRadius;
		const wallY = mid + Math.sin(angle) * wallRadius;
		const wallLength = (2 * Math.PI * wallRadius) / wallCount;

		// Create the wall as a small static rectangle
		const wall = Matter.Bodies.rectangle(
			wallX,
			wallY,
			wallThickness,
			wallLength,
			{
				isStatic: true,
				isSensor: false,
				angle: angle,
				render: { visible: false },
				label: "trap 20",
				collisionFilter: {
					category: TRAP_CATEGORY,
					mask: DISC_CATEGORY
				}
			}
		);

		trap.push(wall);
	}

	Matter.World.add(world, trap);
}

function createTrapRim() {
	const wallCount = 32;
	const wallThickness = Math.max(8, mid * 0.08);
	const wallRadius = S.base * mid + wallThickness / 2;

	const trap = [];

	for (let i = 0; i < wallCount; i++) {
		// Calculate angle for each wall
		const angle = (i / wallCount) * 2 * Math.PI;

		// Calculate the wall position around the center
		const wallX = mid + Math.cos(angle) * wallRadius;
		const wallY = mid + Math.sin(angle) * wallRadius;
		const wallLength = (2 * Math.PI * wallRadius) / wallCount;

		// Create the wall as a small static rectangle
		const wall = Matter.Bodies.rectangle(
			wallX,
			wallY,
			wallThickness,
			wallLength,
			{
				isStatic: true,
				isSensor: false,
				angle: angle,
				render: { visible: false },
				label: "trap rim",
				collisionFilter: {
					category: RIM_CATEGORY,
					mask: DISC_CATEGORY
				}
			}
		);

		trap.push(wall);
	}

	Matter.World.add(world, trap);
}

function createTrapSurface() {
	const wallCount = 32;
	const wallThickness = Math.max(8, mid * 0.06);
	const wallRadius = S.surface * mid - wallThickness / 2;

	const trap = [];

	for (let i = 0; i < wallCount; i++) {
		// Calculate angle for each wall
		const angle = (i / wallCount) * 2 * Math.PI;

		// Calculate the wall position around the center
		const wallX = mid + Math.cos(angle) * wallRadius;
		const wallY = mid + Math.sin(angle) * wallRadius;
		const wallLength = (2 * Math.PI * wallRadius) / wallCount;

		// Create the wall as a small static rectangle
		const wall = Matter.Bodies.rectangle(
			wallX,
			wallY,
			wallThickness,
			wallLength,
			{
				isStatic: true,
				isSensor: false,
				angle: angle,
				render: { visible: false },
				label: "trap surface",
				collisionFilter: {
					category: SURFACE_CATEGORY,
					mask: DISC_CATEGORY
				}
			}
		);

		trap.push(wall);
	}

	Matter.World.add(world, trap);
}

function createPegs() {
	const pegBodies = [];
	const r = S.peg * mid;

	// Loop through 8 pegs
	for (let i = 0; i < 8; i++) {
		const angle = 3 / 8 + (i / 8) * Math.PI * 2;
		const x = mid + Math.cos(angle) * mid * S.fifteen;
		const y = mid + Math.sin(angle) * mid * S.fifteen;

		const peg = Matter.Bodies.circle(x, y, r, {
			isStatic: true,
			restitution: 0.9,
			render: { fillStyle: COLOR.line },
			collisionFilter: {
				category: PEG_CATEGORY,
				mask: DISC_CATEGORY
			}
		});

		pegBodies.push(peg);
	}

	Matter.World.add(world, pegBodies);
}

export function flickDisc() {
	if (!activeDisc) return;

	const maxSpeed = activeDisc.mass * mid * 0.0005;
	const forceMagnitude = maxSpeed * 1;

	const r = Math.random() * 0;

	const angle = Math.atan2(
		mid - activeDisc.position.y,
		mid - activeDisc.position.x
	);

	const forceX = forceMagnitude * Math.cos(angle);
	const forceY = forceMagnitude * Math.sin(angle);

	Matter.Body.applyForce(activeDisc, activeDisc.position, {
		x: forceX,
		y: forceY
	});
}

function createQuadrantLines(render, ctx) {
	const numLines = 4; // Four quadrants
	ctx.beginPath();
	ctx.strokeStyle = COLOR.line; // Black color for the lines
	ctx.lineWidth = 1;

	for (let i = 0; i < numLines; i++) {
		const angle = 3 / 4 + (i / numLines) * Math.PI * 2;

		// Calculate starting (innerR) and ending (outerR) points
		const x1 = mid + Math.cos(angle) * mid * S.five;
		const y1 = mid + Math.sin(angle) * mid * S.five;
		const x2 = mid + Math.cos(angle) * mid * S.ten;
		const y2 = mid + Math.sin(angle) * mid * S.ten;

		// Draw the line from the inner radius to the outer radius
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
	}
	ctx.stroke();
	ctx.closePath();
}

function drawVector(render, ctx) {
	if (!activeDisc || !vector) return;

	ctx.beginPath();
	ctx.strokeStyle = "#555";
	ctx.lineWidth = 2;

	// Draw a line from the active disc's center to the vector endpoint
	ctx.moveTo(activeDisc.position.x, activeDisc.position.y);
	ctx.lineTo(
		activeDisc.position.x + vector.x,
		activeDisc.position.y + vector.y
	);

	ctx.stroke();
	ctx.closePath();
}

function afterRender() {
	const ctx = render.context;
	createQuadrantLines(render, ctx);
	// drawVector(render, ctx);
}

function collisionActive(event) {
	// twenty hole
	event.pairs.forEach(({ bodyA, bodyB }) => {
		const disc =
			bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;
		const zone20 =
			bodyA.label === "20" ? bodyA : bodyB.label === "20" ? bodyB : null;

		if (disc && zone20) {
			const dist = Matter.Vector.magnitude(
				Matter.Vector.sub(disc.position, zone20.position)
			);

			const discRadius = disc.circleRadius;
			const zoneRadius = zone20.circleRadius;

			const distThreshold = discRadius * 0.75;
			const speedThreshold = 10;

			const isClose = dist < distThreshold;
			const isSlow = disc.speed < speedThreshold;

			const enableTrap =
				isClose && isSlow && disc.restitution === DISC_RESTITUTION;

			console.log({ isClose, isSlow });

			if (enableTrap) {
				disc.collisionFilter.mask =
					DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | TRAP_CATEGORY;

				Matter.Body.setVelocity(disc, {
					x: disc.velocity.x * 0.5,
					y: disc.velocity.y * 0.5
				});

				disc.restitution = 0.3;
			}
		}
	});
}

function collisionStart(event) {
	// rim
	event.pairs.forEach(({ bodyA, bodyB }) => {
		const disc =
			bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;
		const rim =
			bodyA.label === "trap rim"
				? bodyA
				: bodyB.label === "trap rim"
					? bodyB
					: null;

		if (disc && rim) {
			disc.frictionAir = 0.3;
			disc.collisionFilter.mask =
				DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | SURFACE_CATEGORY;
		}
	});
}

export function init({ element, width }) {
	const height = width;
	mid = width / 2;
	engine = Matter.Engine.create();
	world = engine.world;

	world.gravity.y = 0;

	runner = Matter.Runner.create();

	render = Matter.Render.create({
		element,
		engine,
		options: {
			width,
			height,
			wireframes: false,
			pixelRatio: "auto",
			background: "transparent"
		}
	});

	createZones();
	createPegs();
	createTrap20();
	createTrapRim();
	createTrapSurface();

	Matter.Events.on(render, "afterRender", afterRender);

	Matter.Runner.run(runner, engine);
	Matter.Render.run(render);

	Matter.Events.on(engine, "collisionActive", collisionActive);
	Matter.Events.on(engine, "collisionStart", collisionStart);
}
