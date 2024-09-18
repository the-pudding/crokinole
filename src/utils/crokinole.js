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
	line: "#888",
	player1: "#c0c",
	player2: "#0cc",
	board: "#fff",
	shadow: "#eee",
	active: "#000"
};

let engine;
let world;
let runner;
let render;

let discs = [];

let mid;
let lineWidth;

let activeDisc;
let shotMaxMagnitude;
let shotVector;
let mode;
let indicatorVisible;

// TODO move private vs public
function updateDiscColors() {
	discs.forEach((d) => {
		d.render.lineWidth = d.id === activeDisc?.id ? 3 : 0;
	});
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
				lineWidth
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
				lineWidth
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
				lineWidth
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
				lineWidth
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
				lineWidth
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
				lineWidth: S.rimWidth
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
	const wallThickness = Math.max(2, mid * 0.05);
	const wallRadius = S.twenty * mid + wallThickness / 2 - 1;

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
	const wallThickness = Math.max(8, mid * 0.2);
	const wallRadius = S.base * mid + wallThickness / 2 - 1;

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
	const wallThickness = Math.max(8, mid * 0.1);
	const wallRadius = S.surface * mid - wallThickness / 2 + 1;

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

function createQuadrants() {
	const numLines = 4; // Four quadrants
	const innerRadius = mid * S.five; // Inner radius for the lines
	const outerRadius = mid * S.ten; // Outer radius for the lines
	const lineWidth = 2; // Thickness of the lines

	// Array to hold the created lines
	const quadrantLines = [];

	for (let i = 0; i < numLines; i++) {
		// Calculate the angle for each line
		const angle = 3 / 4 + (i / numLines) * Math.PI * 2;

		// Calculate the starting and ending points of the line (inner and outer radius)
		const x1 = mid + Math.cos(angle) * innerRadius;
		const y1 = mid + Math.sin(angle) * innerRadius;
		const x2 = mid + Math.cos(angle) * outerRadius;
		const y2 = mid + Math.sin(angle) * outerRadius;

		// Calculate the midpoint for the Matter.js rectangle (line)
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;

		// Calculate the length of the line using the distance between x1, y1 and x2, y2
		const length = Matter.Vector.magnitude({ x: x2 - x1, y: y2 - y1 });

		// Create a line as a static rectangle body with the correct angle
		const line = Matter.Bodies.rectangle(
			midX,
			midY,
			length, // Line length
			lineWidth, // Line thickness
			{
				isStatic: true,
				angle: angle, // Rotate the line to match the angle
				render: {
					fillStyle: COLOR.line // Set the color of the lines
				},
				collisionFilter: {
					category: 0x0000, // No collision category
					mask: 0x0000 // Won't collide with anything
				}
			}
		);

		// Add the line to the quadrant lines array
		quadrantLines.push(line);
	}

	// Add all lines to the Matter.js world
	Matter.World.add(world, quadrantLines);
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

// function afterRender() {
// 	const ctx = render.context;
// 	renderQuadrantLines(ctx);
// 	// drawVector(render, ctx);
// }

function collisionActive(event) {
	// twenty hole
	event.pairs.forEach(({ bodyA, bodyB }) => {
		const disc =
			bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;
		const zone20 =
			bodyA.label === "20" ? bodyA : bodyB.label === "20" ? bodyB : null;

		if (disc && zone20 && !disc.in20) {
			const dist = Matter.Vector.magnitude(
				Matter.Vector.sub(disc.position, zone20.position)
			);

			const discRadius = disc.circleRadius;

			const distThreshold = discRadius * 0.75;
			const speedThreshold = 10;

			const isClose = dist < distThreshold;
			const isSlow = disc.speed < speedThreshold;

			const enableTrap = isClose && isSlow;

			if (enableTrap) {
				disc.in20 = true;
				disc.collisionFilter.mask =
					DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | TRAP_CATEGORY;

				// Matter.Body.setVelocity(disc, {
				// 	x: disc.velocity.x * 0.5,
				// 	y: disc.velocity.y * 0.5
				// });

				disc.restitution = 0.4;
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

function updateShotVector({ target, speed }) {
	if (!activeDisc) return;
	const vector = {
		x: target.x - activeDisc.position.x,
		y: target.y - activeDisc.position.y
	};

	if (speed) {
		// preset flick - if its just a speed and a target
		const normalizedVector = Matter.Vector.normalise(vector);
		const shotVectorMagnitude = speed * shotMaxMagnitude;
		shotVector = Matter.Vector.mult(normalizedVector, shotVectorMagnitude);
	} else {
		// user flick
		const currentMagnitude = Matter.Vector.magnitude(vector);
		const shotVectorMagnitude = Math.min(currentMagnitude, shotMaxMagnitude);

		// update vector based on clamped vector length
		shotVector = Matter.Vector.mult(
			Matter.Vector.normalise(vector),
			shotVectorMagnitude
		);
	}
}

export function addDisc(opts = {}) {
	const player = opts.player || "player1";
	const x = opts.x ? opts.x * mid * 2 : mid;
	const y = opts.y
		? opts.y * mid * 2
		: player === "player1"
			? mid + mid * S.five
			: mid - mid * S.five;
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
			render: {
				fillStyle: COLOR[player],
				strokeStyle: COLOR.active
			},
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
	updateDiscColors();
	shotMaxMagnitude = activeDisc.mass * mid * 0.0007;
}

// export function select({ x, y }) {
// 	const clickedDiscs = Matter.Query.point(discs, { x, y });

// 	if (clickedDiscs.length > 0) {
// 		activeDisc = clickedDiscs[0];
// 		updateDiscColors();
// 	}
// }

export function drag({ x, y }) {
	if (!activeDisc) return;
	updateShotVector({ target: { x, y } });
}

export function release() {
	flickDisc();
}

export function flickDisc(opts) {
	if (!activeDisc) return;
	if (opts && (!opts.target || !opts.speed)) return;
	if (opts && opts.target && opts.speed) {
		const target = {
			x: opts.target.x * mid * 2,
			y: opts.target.y * mid * 2
		};

		const speed = opts.speed;
		updateShotVector({ target, speed });
	}

	Matter.Body.applyForce(activeDisc, activeDisc.position, shotVector);
	activeDisc = undefined;
	updateDiscColors();
}

export function setMode(v) {
	mode = v;
}

export function setIndicatorVisibile(v) {
	indicatorVisibile = v;
}

export function init({ element, width }) {
	const height = width;
	mid = width / 2;
	lineWidth = width < 400 ? 2 : 4;
	shotMaxMagnitude = mid * 0.25;

	setMode("shoot");

	engine = Matter.Engine.create();
	world = engine.world;

	engine.gravity.y = 0;

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
	createQuadrants();
	createPegs();
	createTrap20();
	createTrapRim();
	createTrapSurface();

	// Matter.Events.on(render, "afterRender", afterRender);

	Matter.Runner.run(runner, engine);
	Matter.Render.run(render);

	Matter.Events.on(engine, "collisionActive", collisionActive);
	Matter.Events.on(engine, "collisionStart", collisionStart);
}
