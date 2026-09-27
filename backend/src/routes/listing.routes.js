const express = require('express');
const { getActive, getDonations, create, deleteListing, getMerchantListings, getMerchantStats } = require('../controllers/listing.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createListingSchema } = require('../validators/listing.schema');

const router = express.Router();

router.get('/active', verifyToken, getActive);
router.get('/donations', verifyToken, requireRole('ngo'), getDonations);
router.post('/', verifyToken, requireRole('merchant'), validate(createListingSchema), create);
router.delete('/:id', verifyToken, requireRole('merchant'), deleteListing);
router.get('/merchant', verifyToken, requireRole('merchant'), getMerchantListings);
router.get('/merchant/stats', verifyToken, requireRole('merchant'), getMerchantStats);

module.exports = router;
