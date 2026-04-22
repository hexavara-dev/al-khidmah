export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
}

export interface Category {
    id: number;
    name: string;
    campaigns_count?: number;
}

export interface Campaign {
    id: number;
    title: string;
    description: string;
    image: string | null;
    image_url?: string | null;
    target_amount: number;
    collected_amount: number;
    deadline: string;
    is_active: boolean;
    category_id: number;
    category?: Category;
    donations_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Donation {
    id: number;
    user_id: number;
    campaign_id: number;
    amount: number;
    status: 'pending' | 'success' | 'failed';
    payment_method: string;
    note: string | null;
    order_id: string | null;
    donor_name?: string;
    campaign?: Campaign;
    user?: User;
    created_at: string;
    updated_at: string;
}

export interface Donor {
    id: number;
    amount: number;
    note: string;
    created_at: string;
    donor_name: string;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface PaginatedData<T> extends PaginationMeta {
    data: T[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
