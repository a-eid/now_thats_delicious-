const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const {
  homePage,
  addStore,
  createStore,
  getStores,
  editStore,
  updateStore,
  upload,
  resize,
  getStoreBySlug,
  getStoresByTag,
  searchStores,
  mapStores, //  api => stores that are near by
  mapPage,
  heartStore,
  getHearts,
  getTopStores
} = require("../controllers/storeController");

const {
  loginForm,
  registerForm,
  validateRegister,
  register,
  account,
  updateAccount
} = require("../controllers/userController");
const {
  login,
  logout,
  isLoggedIn,
  forgot,
  reset,
  updatePassword
} = require("../controllers/authController");
const { addReview } = require("../controllers/reviewController");

// store routes
router.get("/", catchErrors(getStores));
router.get("/stores", catchErrors(getStores));
router.get("/stores/page/:page", catchErrors(getStores));
router.get("/add", isLoggedIn, catchErrors(addStore));
router.post(
  "/add",
  isLoggedIn,
  upload,
  catchErrors(resize),
  catchErrors(createStore)
);
router.post("/add/:id", upload, catchErrors(resize), catchErrors(updateStore));
router.get("/store/:id/edit", catchErrors(editStore));
router.get("/store/:slug", catchErrors(getStoreBySlug));

// tags routes
router.get("/tags", catchErrors(getStoresByTag));
router.get("/tags/:tag", catchErrors(getStoresByTag));

//  auth routes
router.get("/login", catchErrors(loginForm));
router.post("/login", login);
router.get("/register", catchErrors(registerForm));
router.post("/register", validateRegister, catchErrors(register), login);
router.get("/logout", logout);
router.get("/account", isLoggedIn, account);
router.post("/account", isLoggedIn, catchErrors(updateAccount));
router.post("/account/forgot", catchErrors(forgot));
router.get("/account/reset/:token", catchErrors(reset));
router.post("/account/reset/:token", catchErrors(updatePassword));
router.get("/map", mapPage);
router.get("/hearts", isLoggedIn, catchErrors(getHearts));
router.post("/reviews/:id", isLoggedIn, catchErrors(addReview));
router.get("/top" , catchErrors(getTopStores))
/*
* API (JSON) responses 
*/
router.get("/api/search", catchErrors(searchStores));
router.get("/api/stores/near", catchErrors(mapStores));
router.post("/api/store/:id/heart", catchErrors(heartStore));

module.exports = router;
