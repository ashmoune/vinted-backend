// importation des modules nécessaires, express pour le serveur et mongoose pour la BDD
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");
// uid2 est un package qui génere des identifiants unique
const uid2 = require("uid2");
// lancement de l'application express
const app = express();
// middleware qui permet de créer des routes en body
app.use(express.json());
app.use(cors());

// connection à la BDD mongodb nommée vinted sur le port 27017/ création de celle ci
mongoose.connect(process.env.MONGODB_URI);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// importation des routes pour user
const userRoutes = require("./routes/user");
app.use(userRoutes);
// importation des routes pour offer
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
// récupération des routes inexistantes et renvoie d'une erreur 404
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});
// démarage du serveur sur le port 3000
app.listen(process.env.PORT, () => {
  console.log("Server has started 🚀🚀🚀");
});
