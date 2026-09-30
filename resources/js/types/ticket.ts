export type TicketStatusValue = 'pending' | 'reserve' | 'successful' | 'taken' | 'cancelled';

export type TicketStatusOption = {
    value: TicketStatusValue;
    label: string;
};

export type TicketScreenshot = {
    id: number;
    url: string;
};

export type TicketAdmin = {
    id: number;
    name: string;
};

export type TicketMessage = {
    id: number;
    sender_type: 'admin' | 'customer';
    message: string;
    created_at: string;
    admin: TicketAdmin | null;
};

export type Ticket = {
    id: number;
    ticket_uid: string;
    name: string;
    email: string;
    phone: string;
    price: string;
    message: string | null;
    status: TicketStatusValue;
    created_at: string;
    screenshots: TicketScreenshot[];
    assigned_admin: TicketAdmin | null;
    user?: { id: number; name: string; email: string } | null;
};

export type TicketFilters = {
    search?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: 'newest' | 'oldest';
};

export type TicketStats = {
    total: number;
    pending: number;
    reserve: number;
    successful: number;
    taken: number;
    cancelled: number;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
};
