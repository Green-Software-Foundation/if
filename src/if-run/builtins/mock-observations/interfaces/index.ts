export type Generator = {
  /**
   * generate the next value, optionally based on historical values
   */
  next: (historical: Object[] | undefined) => Object;
};
