import { Table, Row } from "../documents"
import { EnrichedQueryJson } from "./search"

export const PASSWORD_REPLACEMENT = "--secret-value--"

export enum Operation {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  COUNT = "COUNT",
  BULK_CREATE = "BULK_CREATE",
  BULK_UPSERT = "BULK_UPSERT",
  CREATE_TABLE = "CREATE_TABLE",
  UPDATE_TABLE = "UPDATE_TABLE",
  DELETE_TABLE = "DELETE_TABLE",
}

export const RowOperations = [
  Operation.CREATE,
  Operation.READ,
  Operation.UPDATE,
  Operation.DELETE,
  Operation.BULK_CREATE,
  Operation.BULK_UPSERT,
]

export enum QueryType {
  SQL = "sql",
  JSON = "json",
  FIELDS = "fields",
}

export enum DatasourceFieldType {
  STRING = "string",
  CODE = "code",
  LONGFORM = "longForm",
  BOOLEAN = "boolean",
  NUMBER = "number",
  PASSWORD = "password",
  LIST = "list",
  OBJECT = "object",
  JSON = "json",
  FILE = "file",
  FIELD_GROUP = "fieldGroup",
  SELECT = "select",
}

export enum SourceName {
  AIRTABLE = "AIRTABLE",
  ARANGODB = "ARANGODB",
  BUDIBASE = "BUDIBASE",
  COUCHDB = "COUCHDB",
  DYNAMODB = "DYNAMODB",
  ELASTICSEARCH = "ELASTICSEARCH",
  FIRESTORE = "FIRESTORE",
  GOOGLE_SHEETS = "GOOGLE_SHEETS",
  MONGODB = "MONGODB",
  MYSQL = "MYSQL",
  ORACLE = "ORACLE",
  POSTGRES = "POSTGRES",
  REDIS = "REDIS",
  REST = "REST",
  S3 = "S3",
  SNOWFLAKE = "SNOWFLAKE",
  SQL_SERVER = "SQL_SERVER",
}

export enum IncludeRelationship {
  INCLUDE = 1,
  EXCLUDE = 0,
}

export enum FilterType {
  STRING = "string",
  FUZZY = "fuzzy",
  RANGE = "range",
  EQUAL = "equal",
  NOT_EQUAL = "notEqual",
  EMPTY = "empty",
  NOT_EMPTY = "notEmpty",
  ONE_OF = "oneOf",
}

export enum DatasourceFeature {
  CONNECTION_CHECKING = "connection",
  FETCH_TABLE_NAMES = "fetch_table_names",
  EXPORT_SCHEMA = "export_schema",
}

export interface StepDefinition {
  key: string
  template: string
}

export interface QueryDefinition {
  type: QueryType
  displayName?: string
  readable?: boolean
  customisable?: boolean
  fields?: object
  urlDisplay?: boolean
  steps?: Array<StepDefinition>
}

export interface ExtraQueryConfig {
  [key: string]: {
    displayName: string
    type: string
    required: boolean
    data?: object
  }
}

interface DatasourceBasicFieldConfig {
  type: DatasourceFieldType
  display?: string
  required?: boolean
  default?: any
  deprecated?: boolean
  hidden?: string
  placeholder?: string
}

interface DatasourceSelectFieldConfig extends DatasourceBasicFieldConfig {
  type: DatasourceFieldType.SELECT
  config: { options: string[] }
}

interface DatasourceFieldGroupConfig extends DatasourceBasicFieldConfig {
  type: DatasourceFieldType.FIELD_GROUP
  config: {
    openByDefault?: boolean
    nestedFields?: boolean
  }
}

type DatasourceFieldConfig =
  | DatasourceSelectFieldConfig
  | DatasourceFieldGroupConfig
  | DatasourceBasicFieldConfig

export interface DatasourceConfig {
  [key: string]: DatasourceFieldConfig & {
    fields?: DatasourceConfig
  }
}

export interface Integration {
  docs: string
  plus?: boolean
  isSQL?: boolean
  auth?: { type: string }
  features?: Partial<Record<DatasourceFeature, boolean>>
  relationships?: boolean
  description: string
  friendlyName: string
  type?: string
  iconUrl?: string
  datasource?: DatasourceConfig
  query: {
    [key: string]: QueryDefinition
  }
  extra?: ExtraQueryConfig
}

export type ConnectionInfo = {
  connected: boolean
  error?: string
}

export interface IntegrationBase {
  create?(query: any): Promise<any[] | any>
  read?(query: any): Promise<any[] | any>
  update?(query: any): Promise<any[] | any>
  delete?(query: any): Promise<any[] | any>
  patch?(query: any): Promise<any[] | any>
  testConnection?(): Promise<ConnectionInfo>
  getExternalSchema?(): Promise<string>
  defineTypeCastingFromSchema?(schema: {
    [key: string]: {
      name: string
      type: string
    }
  }): void
}

export interface Schema {
  tables: Record<string, Table>
  errors: Record<string, string>
}

// return these when an operation occurred but we got no response
export enum DSPlusOperation {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
}

export type DatasourcePlusQueryResponse =
  | Row[]
  | Record<DSPlusOperation, boolean>[]
  | { total: number }[]
  | void

export interface DatasourcePlus extends IntegrationBase {
  // if the datasource supports the use of bindings directly (to protect against SQL injection)
  // this returns the format of the identifier
  getBindingIdentifier(): string
  getStringConcat(parts: string[]): string
  query(json: EnrichedQueryJson): Promise<DatasourcePlusQueryResponse>
  buildSchema(
    datasourceId: string,
    entities: Record<string, Table>,
    filter?: string[]
  ): Promise<Schema>
  getTableNames(): Promise<string[]>
}
