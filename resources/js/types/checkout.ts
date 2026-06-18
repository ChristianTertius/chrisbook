export interface CheckoutItem {
    id: number
    title: string;
    price: number
    cover_image?: string | null
    status: 'available' | 'sold'
}

export interface ShippingOption {
    courier: string
    service: string
    description: string
    cost: number
    etd?: string
}
