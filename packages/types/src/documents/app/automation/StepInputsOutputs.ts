import { Table } from "@budibase/types"
import { SortOrder } from "../../../api"
import {
  SearchFilters,
  EmptyFilterOption,
  BasicOperator,
  LogicalOperator,
} from "../../../sdk"
import { HttpMethod } from "../query"
import { Row, RowAttachment } from "../row"
import {
  LoopStepType,
  EmailAttachment,
  AutomationResults,
  AutomationStepResult,
} from "./automation"
import { AutomationStep } from "./schema"

export enum FilterCondition {
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
}

export type BaseAutomationOutputs = {
  success?: boolean
  response?: {
    [key: string]: any
    message?: string
  }
}
export type ExternalAppStepOutputs = {
  httpStatus?: number
  response: string
  success: boolean
}

export type BashStepInputs = {
  code: string
}

export type BashStepOutputs = BaseAutomationOutputs & {
  stdout?: string
}

export type CollectStepInputs = {
  collection: string
}

export type CollectStepOutputs = BaseAutomationOutputs & {
  value?: any
}

export type CreateRowStepInputs = {
  row: Row
}

export type CreateRowStepOutputs = BaseAutomationOutputs & {
  row?: Row
  id?: string
  revision?: string
}

export type DelayStepInputs = {
  time: number
}

export type DelayStepOutputs = BaseAutomationOutputs

export type DeleteRowStepInputs = {
  tableId: string
  id: string
  revision?: string
}

export type DeleteRowStepOutputs = BaseAutomationOutputs & {
  row?: Row
}

export type DiscordStepInputs = {
  url: string
  username?: string
  avatar_url?: string
  content: string
}

export type ExecuteQueryStepInputs = {
  query: {
    queryId: string
    [key: string]: any
  }
}

export type ExecuteQueryStepOutputs = BaseAutomationOutputs & {
  info?: any
}

export type APIRequestStepInputs = {
  query: {
    queryId: string
    [key: string]: any
  }
}

export type APIRequestStepOutputs = BaseAutomationOutputs & {
  info?: any
}

export type ExecuteScriptStepInputs = {
  code: string
}

export type ExecuteScriptStepOutputs = BaseAutomationOutputs & {
  value?: string
}

export type FilterStepInputs = {
  field: any
  condition: FilterCondition
  value: any
}

export type FilterStepOutputs = BaseAutomationOutputs & {
  result: boolean
  refValue?: any
  comparisonValue?: any
}

export type LoopStepInputs = {
  option: LoopStepType
  binding: any
  iterations?: number
  failure?: string
}

export type LoopStepOutputs = {
  items: AutomationStepResult[]
  success: boolean
  iterations: number
}

export type BranchStepInputs = {
  branches: Branch[]
  children?: Record<string, AutomationStep[]>
}

export type Branch = {
  id: any
  name: string
  condition: BranchSearchFilters
  conditionUI?: {
    groups?: {
      filters?: {
        field: string
        operator: BasicOperator
        value: any
      }[]
    }[]
  }
}

export type BranchSearchFilters = Pick<
  SearchFilters,
  | BasicOperator.EQUAL
  | BasicOperator.NOT_EQUAL
  | LogicalOperator.AND
  | LogicalOperator.OR
>

export type MakeIntegrationInputs = {
  url: string
  body: any
}

export type n8nStepInputs = {
  url: string
  method?: HttpMethod
  authorization: string
  body: any
}

export type OpenAIStepInputs = {
  prompt: string
  model: Model
}

export type ClassifyContentStepInputs = {
  inputType: string
  textInput: string
  categoryItems: Array<{
    category: string
  }>
}

export type ClassifyContentStepOutputs = {
  category?: string
  success: boolean
  response?: string
}

export type PromptLLMStepInputs = {
  prompt: string
  model: Model
}

export type PromptLLMStepOutputs = {
  response?: string
  success: boolean
}

export type TranslateStepInputs = {
  text: string
  language: string
}

export type TranslateStepOutputs = {
  response?: string
  success: boolean
}

export type SummariseStepInputs = {
  text: string
  length?: SummariseLength
}

export type SummariseStepOutputs = {
  response?: string
  success: boolean
}

export type GenerateTextStepInputs = {
  contentType: string
  instructions: string
}

export type GenerateTextStepOutputs = {
  success: boolean
  response?: string
}
export type ExtractFileDataStepInputs = {
  file: RowAttachment | string
  source: "URL" | "Attachment"
  fileType?: string
  schema: Record<string, any>
}

export type ExtractFileDataStepOutputs =
  | {
      success: true
      data: Record<string, any>
      response?: string
    }
  | {
      success: false
      data?: Record<string, any>
      response?: string
    }
export enum Model {
  GPT_35_TURBO = "gpt-3.5-turbo",
  // will only work with api keys that have access to the GPT4 API
  GPT_4 = "gpt-4",
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",
}

export enum SummariseLength {
  SHORT = "short",
  MEDIUM = "medium",
  LONG = "long",
}

export type OpenAIStepOutputs = Omit<BaseAutomationOutputs, "response"> & {
  response?: string | null
}

export type QueryRowsStepInputs = {
  tableId: string
  filters?: SearchFilters
  "filters-def"?: any
  sortColumn?: string
  sortOrder?: SortOrder
  limit?: number
  onEmptyFilter?: EmptyFilterOption
}

export type QueryRowsStepOutputs = BaseAutomationOutputs & {
  rows?: Row[]
}

export type SmtpEmailStepInputs = {
  to: string
  from: string
  subject: string
  contents: string
  cc: string
  bcc: string
  addInvite?: boolean
  startTime: Date
  endTime: Date
  summary: string
  location?: string
  url?: string
  attachments?: EmailAttachment[]
}

export type SmtpEmailStepOutputs = BaseAutomationOutputs
export type ServerLogStepInputs = {
  text: string
}

export type ServerLogStepOutputs = BaseAutomationOutputs & {
  message: string
}
export type SlackStepInputs = {
  url: string
  text: string
}

export type TriggerAutomationStepInputs = {
  automation: {
    automationId: string
  }
  timeout?: number
}

export type TriggerAutomationStepOutputs = BaseAutomationOutputs & {
  value?: AutomationResults["steps"]
  status: AutomationResults["status"]
}

export type UpdateRowStepInputs = {
  meta: Record<string, any>
  row: Row
  rowId: string
}

export type UpdateRowStepOutputs = BaseAutomationOutputs & {
  row?: Row
  id?: string
  revision?: string
}

export type ZapierStepInputs = {
  url: string
  body: any
}

export type ZapierStepOutputs = Omit<ExternalAppStepOutputs, "response"> & {
  response: string
}

export enum RequestType {
  POST = "POST",
  GET = "GET",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export type OutgoingWebhookStepInputs = {
  requestMethod: RequestType
  url: string
  requestBody: string
  headers: string | Record<string, string>
}

export type AppActionTriggerOutputs = {
  fields: object
}

export type CronTriggerInputs = {
  cron: string
}

export type CronTriggerOutputs = {
  timestamp: number
}

export type RowDeletedTriggerInputs = {
  tableId: string
}

export type RowDeletedTriggerOutputs = {
  row: Row
}

export type RowCreatedTriggerInputs = {
  tableId: string
  filters?: SearchFilters
}

export type RowCreatedTriggerOutputs = {
  row: Row
  id: string
  revision: string
}

export type RowUpdatedTriggerInputs = {
  tableId: string
  filters?: SearchFilters
}

export type RowUpdatedTriggerOutputs = {
  row: Row
  id: string
  revision?: string
  oldRow?: Row
}

export type WebhookTriggerInputs = {
  schemaUrl: string
  triggerUrl: string
}

export type WebhookTriggerOutputs = Record<string, any> & {
  body: Record<string, any>
}

export type RowActionTriggerInputs = {
  tableId: string
  rowActionId: string
}

export type RowActionTriggerOutputs = {
  row: Row
  id: string
  revision?: string
  table: Table
}
