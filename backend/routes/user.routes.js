const express = require("express");
const router = express.Router();
const { body,query } = require("express-validator");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const mapController = require("../controllers/map.controller");

// Using free APIs: Nominatim (OpenStreetMap) for geocoding and Open Route Service for distance
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullName.firstName")
      .isLength({ min: 3 })
      .withMessage("First name must be atleast three chars long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 chars long"),
  ],
  userController.registerUser
); //register route


router.get(
  '/get-nearby-captains',
  [
    query('lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Invalid latitude'),

    query('lng')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Invalid longitude'),
  ],
  authMiddleware.authUser,
  mapController.getNearbyDrivers
);


router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 chars long"),
  ],
  userController.loginUser
); //login route

router.get("/profile", authMiddleware.authUser, userController.getUserProfile);

router.get("/logout", authMiddleware.authUser, userController.logoutUser);

module.exports = router;
