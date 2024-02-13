const mongoose=require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  is_admin: {
    type: String,
    required: true,
    default: 0,
  },

  is_verified: {
    type: String,
    default: 1,
  },

  is_active: {
    type: String,
    default: 1,
  },

  address: [
    {
      AddName: {
        type: String,
        required: true,
      },
      House: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },

      PIN: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: "home",
      },
    },
  ],
});

module.exports= mongoose.model('User',userSchema)