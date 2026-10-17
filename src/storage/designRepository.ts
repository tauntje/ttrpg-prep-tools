import type { Design } from "../types/design";

export interface DesignRepository {
  save(design: Design): Promise<void>;
  load(id: string): Promise<Design | null>;
}
