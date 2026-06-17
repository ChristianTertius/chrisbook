export interface CartBook {
    id: number,
    title: string,
    slug: string
    price: number,
    status: 'available' | 'sold'
    cover_image?: string | null
}

export interface CartItem {
    id: number
    book: CartBook
}
