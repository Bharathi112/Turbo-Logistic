// routes/vehicle.js
const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehiclesController");

// ✅ Routes
router.get("/", vehicleController.getAllVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.post("/", vehicleController.createVehicle);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
