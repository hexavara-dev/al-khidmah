import type { ComponentType } from 'react';

export type Service = {
    label: string;
    sub: string;
    type: string;
    endpoint: 'prepaid' | 'postpaid';
    icon: ComponentType<{ className?: string }>;
    placeholder: string;
};

export type PricelistItem = {
    product_code: string;
    product_description: string;
    product_nominal: string;
    product_details: string;
    product_price: number;
};

export type Operator = {
    name: string;
    image: string;
    apiName: string;
};
