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

const lineWidth = 8;
const max = 381 + lineWidth;
export const surface = 330 / max;
export const ditchWidth = 51 / max;
export const base = surface + ditchWidth;
export const rimWidth = 12 / max;
export const peg = 4.7625 / max;
export const twenty = 17.5 / max;
export const fifteen = 102 / max;
export const ten = 203 / max;
export const five = 305 / max;
export const disc = 15 / max;
