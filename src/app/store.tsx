import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { DEFAULT_ORIENTATION } from "../shared/model/page";
import type { Card } from "../types/card";
import type { PlacedImage } from "../types/image";
import type { PageOrientation } from "../types/page";
import type { Pin } from "../types/pin";
import type { TextBlock } from "../types/textBlock";
import type { Token } from "../types/token";

type OrientationSetter = Dispatch<SetStateAction<PageOrientation>>;
type SelectionSetter = Dispatch<SetStateAction<string | null>>;

interface DungeonStore {
  orientation: PageOrientation;
  setOrientation: OrientationSetter;
  images: PlacedImage[];
  setImages: Dispatch<SetStateAction<PlacedImage[]>>;
  pins: Pin[];
  setPins: Dispatch<SetStateAction<Pin[]>>;
  textBlocks: TextBlock[];
  setTextBlocks: Dispatch<SetStateAction<TextBlock[]>>;
  selectedId: string | null;
  setSelectedId: SelectionSetter;
}

interface CardsStore {
  orientation: PageOrientation;
  setOrientation: OrientationSetter;
  cards: Card[];
  setCards: Dispatch<SetStateAction<Card[]>>;
  selectedId: string | null;
  setSelectedId: SelectionSetter;
}

interface TokensStore {
  orientation: PageOrientation;
  setOrientation: OrientationSetter;
  tokens: Token[];
  setTokens: Dispatch<SetStateAction<Token[]>>;
  selectedId: string | null;
  setSelectedId: SelectionSetter;
}

const DungeonContext = createContext<DungeonStore | null>(null);
const CardsContext = createContext<CardsStore | null>(null);
const TokensContext = createContext<TokensStore | null>(null);

interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * Hold the tab state above the tabs.
 * A tab keeps its state when React removes it from the tree.
 */
export function AppStateProvider({ children }: AppStateProviderProps) {
  const [dungeonOrientation, setDungeonOrientation] =
    useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [images, setImages] = useState<PlacedImage[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [dungeonSelectedId, setDungeonSelectedId] = useState<string | null>(null);

  const [cardsOrientation, setCardsOrientation] =
    useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsSelectedId, setCardsSelectedId] = useState<string | null>(null);

  const [tokensOrientation, setTokensOrientation] =
    useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensSelectedId, setTokensSelectedId] = useState<string | null>(null);

  const dungeon = useMemo<DungeonStore>(
    () => ({
      orientation: dungeonOrientation,
      setOrientation: setDungeonOrientation,
      images,
      setImages,
      pins,
      setPins,
      textBlocks,
      setTextBlocks,
      selectedId: dungeonSelectedId,
      setSelectedId: setDungeonSelectedId,
    }),
    [dungeonOrientation, images, pins, textBlocks, dungeonSelectedId]
  );

  const cardsStore = useMemo<CardsStore>(
    () => ({
      orientation: cardsOrientation,
      setOrientation: setCardsOrientation,
      cards,
      setCards,
      selectedId: cardsSelectedId,
      setSelectedId: setCardsSelectedId,
    }),
    [cardsOrientation, cards, cardsSelectedId]
  );

  const tokensStore = useMemo<TokensStore>(
    () => ({
      orientation: tokensOrientation,
      setOrientation: setTokensOrientation,
      tokens,
      setTokens,
      selectedId: tokensSelectedId,
      setSelectedId: setTokensSelectedId,
    }),
    [tokensOrientation, tokens, tokensSelectedId]
  );

  return (
    <DungeonContext.Provider value={dungeon}>
      <CardsContext.Provider value={cardsStore}>
        <TokensContext.Provider value={tokensStore}>{children}</TokensContext.Provider>
      </CardsContext.Provider>
    </DungeonContext.Provider>
  );
}

export function useDungeonStore(): DungeonStore {
  const store = useContext(DungeonContext);
  if (store === null) {
    throw new Error("useDungeonStore needs the AppStateProvider");
  }
  return store;
}

export function useCardsStore(): CardsStore {
  const store = useContext(CardsContext);
  if (store === null) {
    throw new Error("useCardsStore needs the AppStateProvider");
  }
  return store;
}

export function useTokensStore(): TokensStore {
  const store = useContext(TokensContext);
  if (store === null) {
    throw new Error("useTokensStore needs the AppStateProvider");
  }
  return store;
}
