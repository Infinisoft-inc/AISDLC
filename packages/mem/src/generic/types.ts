export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ListResult = {
  totalCount: number;
  limit: number;
  pageSize: number;
  pageNumber: number;
};

export type ActionResultList<TElement> = ActionResult<TElement[]> & ListResult;

export interface IMemoryNetwork {
  write<T>(key: string, data: T): Promise<ActionResult<T>>;
  read<T>(key: string): Promise<ActionResult<T>>;
  update<T>(key: string, data: T): Promise<ActionResult<T>>;
  delete(key: string): Promise<ActionResult<boolean>>;
  list<T>(): Promise<ActionResultList<T>>;
  search?<T>(query: string): Promise<ActionResultList<T>>;
  filter?<T, P>(predicate: (item: P) => boolean): Promise<ActionResultList<T>>;
}
