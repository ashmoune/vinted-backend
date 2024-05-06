const express = require("express");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

const fileUpload = require("express-fileupload");

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      console.log(req.user);

      const { description, price, condition, city, brand, size, color, title } =
        req.body;
      const picture = req.files.picture;

      const cloudinaryResponse = await cloudinary.uploader.upload(
        convertToBase64(picture)
      );

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
        product_image: cloudinaryResponse,
        owner: req.user,
      });

      await newOffer.save();

      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    console.log(req.query);
    // const title = req.query.title;
    const { title, priceMin, priceMax, sort, page } = req.query;
    // console.log(priceMin);

    const filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = { $gte: priceMin };
    }

    if (priceMax) {
      if (priceMin) {
        filters.product_price.$lte = priceMax;
      } else {
        filters.product_price = { $lte: priceMax };
      }
    }

    const sorter = {};

    if (sort === "price-asc") {
      sorter.product_price = "asc";
    } else if (sort === "price-desc") {
      sorter.product_price = "desc";
    }

    let skip = 0;

    if (page) {
      skip = (page - 1) * 5;
    }

    console.log(filters);
    const offers = await Offer.find(filters)
      .sort(sorter)
      .skip(skip)
      .limit(40)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filters);

    res.json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findById(id).populate("owner", "account");
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
