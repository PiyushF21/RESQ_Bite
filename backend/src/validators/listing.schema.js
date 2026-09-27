const { z } = require('zod');

const createListingSchema = z.object({
    item_name: z.string().min(1),
    description: z.string().min(1),
    quantity_available: z.number().int().positive(),
    base_price: z.number().positive(),
    min_price: z.number().positive(),
    pickup_end_time: z.string()
});

module.exports = { createListingSchema };
