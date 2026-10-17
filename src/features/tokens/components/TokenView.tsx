import type { Token } from "../../../types/token";
import { imageRenderSize, ringWidthMm, tokenTitle } from "../model/token";

interface TokenViewProps {
  token: Token;
}

/**
 * Show one token. A round window holds the picture.
 * A coloured ring sits above the picture.
 */
export function TokenView({ token }: TokenViewProps) {
  const sizeMm = token.sizeMm;
  const render = imageRenderSize(token);
  const leftMm = (sizeMm - render.widthMm) / 2 + token.imageXMm;
  const topMm = (sizeMm - render.heightMm) / 2 + token.imageYMm;

  return (
    <article className="token" style={{ width: `${sizeMm}mm`, height: `${sizeMm}mm` }}>
      <img
        className="token-image"
        src={token.src}
        alt={tokenTitle(token)}
        draggable={false}
        style={{
          left: `${leftMm}mm`,
          top: `${topMm}mm`,
          width: `${render.widthMm}mm`,
        }}
      />
      <span
        className="token-ring"
        aria-hidden="true"
        style={{
          borderWidth: `${ringWidthMm(sizeMm)}mm`,
          borderColor: token.ringColour,
        }}
      />
    </article>
  );
}
