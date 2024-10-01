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

// 774 total
export const rimW = 6;
export const surfaceR = 330;
export const ditchW = 51;
export const pegR = 4.7625;
export const twentyR = 17.5;
export const fifteenR = 102;
export const tenR = 203;
export const fiveR = 305;
export const discR = 15;
export const baseR = surfaceR + ditchW;
export const boardR = baseR + rimW;
export const center = boardR;

export const uiHeight = 88;
export const scoreHeight = 39;
export const marginBottom = 32;
export const stepperPadding = 32;
export const marginSide = 0;
