/**
 * Nodel from the backend
 */
export interface Model {
    app_cost: string;
    app_id: string;
    app_name: string;
    app_subtype: string;
    app_type: string;
    database_cost: string;
    database_date_created: string;
    database_discoverable: boolean;
    database_global: boolean;
    database_id: string;
    database_name: string;
    database_subtype: string;
    database_type: string;
    low_database_name: string;
}

/**
 * Instructions from the backend
 */
export interface Instructions {
    /** ID of the instructions */
    id: string;

    /** Description */
    description: string;

    /** Context info */
    context: string;
}
