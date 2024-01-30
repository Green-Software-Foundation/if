import { ModelParams } from './model-interface';
import { AggregationMethodsName, AggregationResult } from './aggregator';
import { UnitKeyName } from './units';

type Tag = {
  kind?: string;
  complexity?: string;
  category?: string;
};

type Model = {
  name: string;
  verbose?: boolean;
  path: string;
  config?: Config;
  model: string;
};

export type Config = Record<string, any>;

/**
 * Appends given `T` type to nested property.
 */
type StructureManager<T> = {
  [key: string]: T;
};

/**
 * Base interface for graph contents.
 */
interface NodeBase {
  pipeline?: string[];
  config?: Config;
  outputs?: ModelParams[];
  'aggregated-outputs'?: AggregationResult;
}

/**
 * Setup modifiers.
 */
type WithInputs = {
  inputs: ModelParams[];
};
type WithChildren = {
  children: ChildStructure;
};

/**
 * Child node interface.
 */
type ChildBase = NodeBase;

/**
 * Setup parent graph node type.
 */
interface ParentBase extends NodeBase {
  pipeline: string[];
  config: Config;
}

/**
 * Node definitions.
 */
export type ParentNode = ParentBase & (WithInputs | WithChildren);
export type ChildNode = ChildBase & (WithInputs | WithChildren);

/**
 * Structure definitions.
 */
export type ParentStructure = StructureManager<ParentNode>;
export type ChildStructure = StructureManager<ChildNode>;

/**
 * Type guard for inputs.
 */
export const hasInputs = <T>(object: any): object is T & WithInputs =>
  'inputs' in object;

/**
 * Type guard for children.
 */
export const hasChildren = <T>(object: any): object is T & WithChildren =>
  'children' in object;

/**
 * Parent guard for children.
 */
export const isNodeParent = (
  _object: any,
  state: ChildStructure | undefined
): _object is ParentStructure => !state;

export type Impl = {
  name: string;
  description: string | null | undefined;
  tags: Tag | null | undefined;
  params?: Object[] | undefined | null;

  initialize: {
    models: Model[];
  };
  graph: {
    children: ParentStructure;
  };
  aggregation?: {
    metrics: UnitKeyName[];
    type: AggregationMethodsName;
  };
  'aggregated-outputs'?: AggregationResult;
};
