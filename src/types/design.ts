export interface PageSize {
  widthMm: number;
  heightMm: number;
}

export interface Design {
  id: string;
  page: PageSize;
}
