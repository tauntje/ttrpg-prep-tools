import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { primaryId } from "../shared/model/multiSelection";
import { DEFAULT_ORIENTATION } from "../shared/model/page";
import type { Card } from "../types/card";
import type { PlacedImage } from "../types/image";
import type { PageOrientation } from "../types/page";
import type { Pin } from "../types/pin";
import type { TextBlock } from "../types/textBlock";
import type { Token } from "../types/token";

type OrientationSetter = Dispatch<SetStateAction<PageOrientation>>;
type SelectionIdsSetter = Dispatch<SetStateAction<string[]>>;

/** Replace the selection with one item, or clear it. */
type SelectionSetter = (id: string | null) => void;

interface DungeonStore {
  orientation: PageOrientation;
  setOrientation: OrientationSetter;
  images: PlacedImage[];
  setImages: Dispatch<SetStateAction<PlacedImage[]>>;
  pins: Pin[];
  setPins: Dispatch<SetStateAction<Pin[]>>;
  textBlocks: TextBlock[];
  setTextBlocks: Dispatch<SetStateAction<TextBlock[]>>;
  selectedIds: string[];
  setSelectedIds: SelectionIdsSetter;
  selectedId: string | null;
  setSelectedId: SelectionSetter;
}

interface CardsStore {
  orientation: PageOrientation;
  setOrientation: OrientationSetter;
  cards: Card[];
  setCards: Dispatch<SetStateAction<Card[]>>;
  selectedIds: string[];
  setSelectedIds: SelectionIdsSetter;
  selectedId: string | null;
  setSelectedId: SelectionSetter;
}

interface TokensStore {
  orientation: PageOrientation;
  setOrientation: OrientationSetter;
  tokens: Token[];
  setTokens: Dispatch<SetStateAction<Token[]>>;
  selectedIds: string[];
  setSelectedIds: SelectionIdsSetter;
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
  const [dungeonSelectedIds, setDungeonSelectedIds] = useState<string[]>([]);

  const [cardsOrientation, setCardsOrientation] =
    useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardsSelectedIds, setCardsSelectedIds] = useState<string[]>([]);

  const [tokensOrientation, setTokensOrientation] =
    useState<PageOrientation>(DEFAULT_ORIENTATION);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokensSelectedIds, setTokensSelectedIds] = useState<string[]>([]);

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
      selectedIds: dungeonSelectedIds,
      setSelectedIds: setDungeonSelectedIds,
      selectedId: primaryId(dungeonSelectedIds),
      setSelectedId: (id) => setDungeonSelectedIds(id === null ? [] : [id]),
    }),
    [dungeonOrientation, images, pins, textBlocks, dungeonSelectedIds]
  );

  const cardsStore = useMemo<CardsStore>(
    () => ({
      orientation: cardsOrientation,
      setOrientation: setCardsOrientation,
      cards,
      setCards,
      selectedIds: cardsSelectedIds,
      setSelectedIds: setCardsSelectedIds,
      selectedId: primaryId(cardsSelectedIds),
      setSelectedId: (id) => setCardsSelectedIds(id === null ? [] : [id]),
    }),
    [cardsOrientation, cards, cardsSelectedIds]
  );

  const tokensStore = useMemo<TokensStore>(
    () => ({
      orientation: tokensOrientation,
      setOrientation: setTokensOrientation,
      tokens,
      setTokens,
      selectedIds: tokensSelectedIds,
      setSelectedIds: setTokensSelectedIds,
      selectedId: primaryId(tokensSelectedIds),
      setSelectedId: (id) => setTokensSelectedIds(id === null ? [] : [id]),
    }),
    [tokensOrientation, tokens, tokensSelectedIds]
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
