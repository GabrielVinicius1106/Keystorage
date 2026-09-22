export interface KeyValue {
    key:          string
    value:        string | number | boolean
    created_at:   Date
    expires_at:   Date
    time_to_live: number
}

export interface GetAllKeyValues {
    code:     string
    elements: KeyValue[]
    status:   string
}


export interface GetKeyValue {
    code:    string
    element: KeyValue
    status:  string
}

export type getKeyValueResponse     = GetKeyValue | null

export type getAllKeyValuesResponse = GetAllKeyValues | null