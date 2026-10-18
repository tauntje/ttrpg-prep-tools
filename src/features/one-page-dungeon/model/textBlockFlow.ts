import type { PlacedImage } from "../../../types/image";
import type { PageSize } from "../../../types/page";

const MARGIN_MM = 8;
const GAP_MM = 5;
const MIN_COLUMN_MM = 45;
const MAX_COLUMN_COUNT = 3;

export interface TextBlockFlow {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  columnCount: number;
  topGapMm: number;
}

interface ImageBox {
  leftMm: number;
  topMm: number;
  rightMm: number;
  bottomMm: number;
}

/** Get the box around all the images on the page. */
function imageBox(images: PlacedImage[]): ImageBox | null {
  if (images.length === 0) {
    return null;
  }

  let leftMm = images[0].xMm;
  let topMm = images[0].yMm;
  let rightMm = images[0].xMm + images[0].widthMm;
  let bottomMm = images[0].yMm + images[0].heightMm;

  for (const image of images) {
    leftMm = Math.min(leftMm, image.xMm);
    topMm = Math.min(topMm, image.yMm);
    rightMm = Math.max(rightMm, image.xMm + image.widthMm);
    bottomMm = Math.max(bottomMm, image.yMm + image.heightMm);
  }

  return { leftMm, topMm, rightMm, bottomMm };
}

/**
 * Get the number of columns that fit in the flow width.
 * Keep each column wide enough to hold the image.
 */
function columnCount(widthMm: number, imageWidthMm: number): number {
  const minWidthMm = Math.max(MIN_COLUMN_MM, imageWidthMm);
  const count = Math.floor((widthMm + GAP_MM) / (minWidthMm + GAP_MM));
  return Math.min(Math.max(count, 1), MAX_COLUMN_COUNT);
}

function columnWidth(widthMm: number, count: number): number {
  return (widthMm - (count - 1) * GAP_MM) / count;
}

/**
 * Put the text blocks in the full content area.
 * A gap pushes the first column below the image. The other columns start at the top.
 */
export function textBlockFlow(images: PlacedImage[], page: PageSize): TextBlockFlow {
  const xMm = MARGIN_MM;
  const yMm = MARGIN_MM;
  const widthMm = page.widthMm - MARGIN_MM * 2;
  const heightMm = page.heightMm - MARGIN_MM * 2;

  const box = imageBox(images);
  if (box === null) {
    return {
      xMm,
      yMm,
      widthMm,
      heightMm,
      columnCount: columnCount(widthMm, 0),
      topGapMm: 0,
    };
  }

  const imageWidthMm = box.rightMm - box.leftMm;
  const count = columnCount(widthMm, imageWidthMm);
  const firstColumnRightMm = xMm + columnWidth(widthMm, count);
  const imageOverlapsFirstColumn = box.leftMm < firstColumnRightMm && box.rightMm > xMm;
  const wantedGapMm = box.bottomMm + GAP_MM - yMm;
  const topGapMm = imageOverlapsFirstColumn
    ? Math.min(Math.max(wantedGapMm, 0), heightMm)
    : 0;

  return { xMm, yMm, widthMm, heightMm, columnCount: count, topGapMm };
}
