const express = require("express");
const router = express.Router();
const customersController = require("../controllers/customersController");

// ✅ Routes
router.get("/", customersController.getAllCustomers);
router.get("/:id", customersController.getCustomerById);
router.post("/", customersController.createCustomer);
router.put("/:id", customersController.updateCustomer);
router.get("/username/:username", customersController.getCustomerByUsername); // Get customer by username
router.get("/agent/:agent_username", customersController.getCustomersByAgentUsername); // Get customers by agent username
router.delete("/:id", customersController.deleteCustomer);

module.exports = router;