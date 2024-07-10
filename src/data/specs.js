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

export const mm = 0.001;
export const surfaceRadius = 330 * mm;
export const holeRadius = 17.5 * mm;
export const surfaceHeight = 12.7 * mm;
export const ditchWidth = 51 * mm;
export const rimWidth = 6.35 * mm;
export const rimHeight = 38.1 * mm;
export const pegRadius = 4.7625 * mm;
export const pegHeight = 12.7 * mm;
export const innerCircleRadius = 102 * mm;
export const middleCircleRadius = 203 * mm;
export const outerCircleRadius = 305 * mm;
export const discRadius = 15 * mm;
export const discHeight = 10 * mm;
export const baseHeight = surfaceHeight / 2;
export const baseRadius = surfaceRadius + ditchWidth;
export const segments = 96;
