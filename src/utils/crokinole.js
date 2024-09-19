import Matter from "matter-js";
import * as S from "$data/specs.js";
import variables from "$data/variables.json";

const DISC_CATEGORY = 0x0001;
const PEG_CATEGORY = 0x0002;
const TRAP_CATEGORY = 0x0004;
const RIM_CATEGORY = 0x0008;
const SURFACE_CATEGORY = 0x0010;
const DISC_RESTITUTION = 0.9;
const DISC_DENSITY = 0.05;
const DISC_FRICTIONAIR = 0.05;

const COLOR = {
	player1: "#c0c",
	player2: "#0cc",
	active: "#000",
	vector: "#000",
	peg: variables.color["gray-400"]
};

let engine;
let world;
let runner;
let render;

let discs = [];

let mid;

let activeDisc;
let shotMaxMagnitude;
let shotMaxIndicatorMagnitude;
let shotVector;
let indicatorVector;
let mode;
let indicatorVisible;

// TODO move private vs public
function updateDiscColors() {
	// discs.forEach((d) => {
	// 	d.render.lineWidth = d.id === activeDisc?.id ? 3 : 0;
	// });
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
				visible: false
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
				visible: false
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
				visible: false
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
				visible: false
			},
			label: "5"
		},
		64
	);

	Matter.World.add(world, [zone5, zone10, zone15, zone20]);
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
			render: { fillStyle: COLOR.peg },
			collisionFilter: {
				category: PEG_CATEGORY,
				mask: DISC_CATEGORY
			}
		});

		pegBodies.push(peg);
	}

	Matter.World.add(world, pegBodies);
}

function drawIndicator(ctx) {
	if (!activeDisc || !indicatorVector) return;

	const discRadius = activeDisc.circleRadius; // Get the radius of the disc

	// Calculate the direction of the vector (normalized)
	const normalizedVector = Matter.Vector.normalise(indicatorVector);

	// Shift the starting point to the edge of the disc by moving in the direction of the normalized vector
	const startX = activeDisc.position.x + normalizedVector.x;
	const startY = activeDisc.position.y + normalizedVector.y;

	// Calculate the end points for the main line and the opposite dashed line
	const endX = activeDisc.position.x + indicatorVector.x;
	const endY = activeDisc.position.y + indicatorVector.y;
	const mirrorX = activeDisc.position.x - indicatorVector.x;
	const mirrorY = activeDisc.position.y - indicatorVector.y;

	// Start drawing the main indicator line
	ctx.beginPath();
	ctx.strokeStyle = COLOR.vector;
	ctx.lineWidth = 2;

	// Draw the solid line starting from the outer edge of the disc
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();

	// Draw the arrow at the end of the line
	const arrowLength = mid * 0.03; // Length of the arrowhead
	const arrowAngle = Math.PI / 4; // Angle for the arrowhead

	// Calculate direction of the arrow based on the indicatorVector
	const angle = Math.atan2(indicatorVector.y, indicatorVector.x);

	// Draw the two lines of the arrowhead
	ctx.beginPath();
	ctx.moveTo(endX, endY);
	ctx.lineTo(
		endX - arrowLength * Math.cos(angle - arrowAngle),
		endY - arrowLength * Math.sin(angle - arrowAngle)
	);
	ctx.moveTo(endX, endY);
	ctx.lineTo(
		endX - arrowLength * Math.cos(angle + arrowAngle),
		endY - arrowLength * Math.sin(angle + arrowAngle)
	);
	ctx.stroke();

	// Draw the dashed line in the mirror opposite direction, also starting from the disc's edge
	const mirrorStartX = activeDisc.position.x - normalizedVector.x * discRadius;
	const mirrorStartY = activeDisc.position.y - normalizedVector.y * discRadius;

	ctx.setLineDash([5, 5]); // Define the dash pattern [dash length, space length]
	ctx.beginPath();
	ctx.moveTo(mirrorStartX, mirrorStartY);
	ctx.lineTo(mirrorX, mirrorY);
	ctx.stroke();
	ctx.setLineDash([]); // Reset to solid lines for future drawing

	ctx.closePath();
}

function afterRender() {
	const ctx = render.context;
	// renderQuadrantLines(ctx);
	if (indicatorVisible) drawIndicator(ctx);
}

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

	const normalizedVector = Matter.Vector.normalise(vector);

	if (speed) {
		// preset flick - if its just a speed and a target
		const shotVectorMagnitude = speed * shotMaxMagnitude;
		shotVector = Matter.Vector.mult(normalizedVector, shotVectorMagnitude);
	} else {
		// user flick
		const currentMagnitude = Matter.Vector.magnitude(vector);
		const indicatorMagnitude = Math.min(
			currentMagnitude,
			shotMaxIndicatorMagnitude
		);

		const shotVectorMagnitude =
			(indicatorMagnitude / shotMaxIndicatorMagnitude) * shotMaxMagnitude;

		// update vector based on clamped vector length
		shotVector = Matter.Vector.mult(normalizedVector, shotVectorMagnitude);

		// visual version
		indicatorVector = Matter.Vector.mult(normalizedVector, indicatorMagnitude);
	}
}

function panCameraToFollowDisc(disc) {
	// Define how much margin you want around the disc when following
	const margin = 100; // Adjust this value to control how much margin around the disc

	// Calculate the bounds to center the camera on the disc
	render.bounds.min.x = disc.position.x - render.options.width / 2 + margin;
	render.bounds.min.y = disc.position.y - render.options.height / 2 + margin;
	render.bounds.max.x = disc.position.x + render.options.width / 2 - margin;
	render.bounds.max.y = disc.position.y + render.options.height / 2 - margin;
}

function zoomCamera(scale) {
	const centerX = (render.bounds.min.x + render.bounds.max.x) / 2;
	const centerY = (render.bounds.min.y + render.bounds.max.y) / 2;

	// Apply zoom by scaling the bounds
	const newWidth = render.options.width * scale;
	const newHeight = render.options.height * scale;

	render.bounds.min.x = centerX - newWidth / 2;
	render.bounds.min.y = centerY - newHeight / 2;
	render.bounds.max.x = centerX + newWidth / 2;
	render.bounds.max.y = centerY + newHeight / 2;
}

// function afterUpdate() {
// 	const threshold = 0.1;
// 	const stillMoving = discs.some((d) => d.speed >= threshold);
// }

function onSleepStart(event) {
	console.log(event);
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
			},
			sleepThreshold: 1,
			isSleeping: true
		},
		64
	);

	Matter.Events.on(disc, "sleepStart", onSleepStart);
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

export function drag(mouse) {
	if (!activeDisc) return;
	setIndicatorVisible(true);
	// calculate the inverse of the mouse position from the active disc position
	// this will be the target for the flick
	const diffX = activeDisc.position.x - mouse.x;
	const diffY = activeDisc.position.y - mouse.y;
	const x = activeDisc.position.x + diffX;
	const y = activeDisc.position.y + diffY;
	updateShotVector({ target: { x, y } });
}

export function release() {
	flickDisc();
}

export function flickDisc(opts) {
	if (!activeDisc) return;
	if (opts && (!opts.target || !opts.speed)) return;

	setIndicatorVisible(false);

	if (opts && opts.target && opts.speed) {
		const target = {
			x: opts.target.x * mid * 2,
			y: opts.target.y * mid * 2
		};

		const speed = opts.speed;
		updateShotVector({ target, speed });
	}

	Matter.Body.applyForce(activeDisc, activeDisc.position, shotVector);
	updateDiscColors();
}

export function setMode(v) {
	mode = v;
}

export function setIndicatorVisible(v) {
	indicatorVisible = v;
}

export function init({ element, width }) {
	const height = width;
	mid = width / 2;
	shotMaxIndicatorMagnitude = mid * 0.2;

	setMode("shoot");

	engine = Matter.Engine.create({
		enableSleeping: true // Globally enable sleeping
	});
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
			background: "transparent",
			hasBounds: true,
			showSleeping: false // Disable sleeping visual cue (like opacity change)
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

	// Matter.Events.on(engine, "afterUpdate", afterUpdate);
	// 	if (activeDisc) {
	// 		// Pan to follow the disc
	// 		panCameraToFollowDisc(activeDisc);

	// 		// Optionally, apply zoom based on the speed of the disc or other factors
	// 		// For example, zoom in when the disc is moving fast and zoom out when it's slow
	// 		const speed = Matter.Vector.magnitude(activeDisc.velocity);
	// 		const zoomScale = 1;
	// 		zoomCamera(zoomScale);
	// 	}
	// });
}
