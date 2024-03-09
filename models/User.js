// importation de mongoose
const mongoose = require("mongoose");

// On va chercher en BDD un utilisateur dont le mail correspond
const user = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: Object, // nous verrons plus tard comment uploader une image
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

// exportation du modele user
module.exports = user;
