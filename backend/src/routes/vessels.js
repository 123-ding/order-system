const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const vesselController = require('../controllers/vesselController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', vesselController.getVessels);
router.get('/:id', vesselController.getVesselById);

router.post('/', authorize('admin', 'operator'), [
  body('vessel_name').trim().notEmpty().withMessage('Vessel name required'),
  body('vessel_type').isIn(['container', 'bulk_carrier', 'tanker', 'ro_ro']).withMessage('Invalid vessel type'),
  body('registration_no').trim().notEmpty().withMessage('Registration number required'),
], vesselController.createVessel);

router.put('/:id', authorize('admin', 'operator'), vesselController.updateVessel);

router.put('/:id/status', authorize('admin', 'operator'), [
  body('status').isIn(['available', 'in_use', 'maintenance', 'retired']).withMessage('Invalid status'),
], vesselController.updateVesselStatus);

router.delete('/:id', authorize('admin'), vesselController.deleteVessel);

module.exports = router;
