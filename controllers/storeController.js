const mongoose = require("mongoose");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");
const Store = mongoose.model("Store");
const User = mongoose.model("User");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: `that file type is's allowed` }, false);
    }
  }
};

exports.homePage = async (req, res, next) => {
  res.render("index", {
    title: "Home"
  });
};

exports.addStore = async (req, res, next) => {
  res.render("editStore", {
    title: "Add Store"
  });
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  if (!req.file) return next();
  const ext = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${ext}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

exports.createStore = async (req, res, next) => {
  req.body.author = req.user._id; // this is the current user
  const store = await new Store(req.body).save();
  req.flash("success", `successfully created ${store.name}`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res, next) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = page * limit - limit;

  const storesPromise = Store.find({}).skip(skip).limit(limit).sort({created: "desc"});
  const countPromise = Store.count();
  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash(
      "info",
      `you asked for page ${page} but that does't exit , this is the last page number ${pages}`
    );
    return res.redirect(`/stores/page/${pages}`);
  }

  res.render("stores", {
    title: "Stores",
    stores,
    page,
    pages,
    count
  });
};

const confirmOwner = (store, user) =>
  store.author && store.author.equals(user._id);

exports.editStore = async (req, res, next) => {
  const store = await Store.findById(req.params.id);
  if (!confirmOwner(store, req.user)) {
    req.flash("error", "store is not owned by you");
    return res.redirect("back");
  }
  res.render("editStore", {
    title: `Edit ${store.name}`,
    store
  });
};

exports.updateStore = async (req, res, next) => {
  req.body.location.type = "Point";
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true // otherwise it will run valiadtors only on initial creation.
  });
  req.flash("success", "Store updated Successfully");
  res.redirect(`/store/${store.slug}`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author reviews"
  );
  if (!store) return next();
  res.render("store", {
    title: store.name,
    store
  });
};

exports.getStoresByTag = async (req, res, next) => {
  router.get("/stores", catchErrors(getStores));
  const activeTag = req.params.tag;
  const tagsPromise = Store.getTagsList();

  const storesPromise = Store.find(activeTag ? { tags: activeTag } : {});
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render("tag", {
    title: activeTag || "tags",
    tags,
    stores
  });
};

exports.mapPage = (req, res, next) => {
  res.render("map", {
    title: "Map"
  });
};

exports.getHearts = async (req, res, next) => {
  const stores = await Store.find({
    _id: { $in: req.user.hearts }
  });
  res.render("stores", {
    title: "hearted stores",
    stores
  });
};

exports.getTopStores = async (req, res, next) => {
  const stores = await Store.getTopStores();
  // res.json(stores)
  res.render("topStores", { stores, title: "top stores" });
};

exports.searchStores = async (req, res, next) => {
  if (!req.query.q) return res.json({ error: "no query string q" });
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(5);

  res.json(stores);
};

exports.mapStores = async (req, res, next) => {
  // ?lat=num&lng=num&max=..
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const max = req.query.max && parseFloat(req.query.max) * 1000;
  const limit = req.query.limit && parseFloat(req.query.limit);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: max || 10000 // in meters 10km
      }
    }
  };
  const stores = await Store.find(q)
    .select("slug location name description ")
    .limit(limit || 10);
  res.json(stores);
};

exports.heartStore = async (req, res, next) => {
  const hearts = req.user.hearts.map(heartObj => heartObj.toString());
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      [operator]: { hearts: req.params.id }
    },
    { new: true }
  );
  res.json(user);
};
