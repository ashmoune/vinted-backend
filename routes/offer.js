// importation d"express pour les routes
const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
// importation d'un model offer
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// route qui permet de publier une annonce
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, brand, size, condition, color, city } =
        req.body;
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],

        product_image: req.files,

        owner: req.user,
      });

      // await owner.save();
      // const result = await cloudinary.uploader.upload(
      //   convertToBase64(req.files.picture)
      // );
      // newOffer.product_image = result;
      // console.log(result);
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offer", async (req, res) => {
  try {
    const { title, priceMin, priceMax } = req.query;
    // console.log(priceMin);

    const filters = {
      // product_name: new RegExp(title, "i"),
      // product_price: { $gte: priceMin },
    };

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: priceMin };
      // console.log(filters);
    }

    if (priceMax) {
      if (priceMin) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: priceMax };
      }

      // console.log(filters);
    }
    const sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1; //descendant
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1; //ascendant
    }
    let limit = 5;
    if (req.query.limit) {
      limit = req.query.limit;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const skip = (page - 1) * limit;
    const results = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const count = await Offer.countDocuments(filters);
    res.json({ count: count, offers: results });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).res.json({ error: error.message });
  }
});

module.exports = router;
