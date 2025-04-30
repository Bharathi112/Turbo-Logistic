const express = require("express");
const router = express.Router();
const ownersController = require("../controllers/ownersController");
const multer = require("multer");
const path = require("path");

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Routes
router.get("/", ownersController.getAllOwners);
router.get("/:id", ownersController.getOwnerById);
router.get("/username/:username", ownersController.getOwnerByUsername); // ✅ Added route to get owner by username
router.post("/", upload.single("id_proof"), ownersController.createOwner);
router.put("/:id", upload.single("id_proof"), ownersController.updateOwner);
router.delete("/:id", ownersController.deleteOwner);

module.exports = router;
