export type Order = {
    $id: string;
    $createdAt: string;

    receiverId: string;

    userEmail: string;
    address: string;
    notes: string;
    items: string;
    total_price: number;

    status: "pending" | "on_the_way" | "done";
    assignedStaffId?: string | null;
};