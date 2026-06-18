export interface Address {
    id: number
    recipient_name: string
    phone: string
    full_address: string
    province_id: string
    province_name: string
    city_id: string
    postal_code?: string | null
    is_default: boolean
}

export interface Region {
    id: string
    name: string
}
