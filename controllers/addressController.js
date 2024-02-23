
const Address = require("../models/addressModel");




const addAddress = async (req, res) => {
  try {
    res.render("addAddress");
  } catch (error) {
    console.log(error.message);
  }
};

const add_Address = async (req, res, next) => {
  try {
   
    const { type, AddName, House, street, state, city, PIN } = req.body;

    const newAddress = {
      AddName,
      House,
      street,
      state,
      city,
      PIN,
      type,
    };

    const existingAddress = await Address.findOne({ user: req.body.userID });

    if (existingAddress) {
      if (existingAddress.address.length >= 4) {
        return res.redirect("/profile?selected=AddressSize");
      }

      existingAddress.address.push(newAddress);
      await existingAddress.save();
      return res.redirect("/profile?selected=Address");
    } else {
      const address = new Address({
        user: req.body.userID,
        address: [newAddress],
      });

      await address.save();
    }

    let pageinfo = "Address";
    res.redirect("/profile?selected=Address");
  } catch (error) {
    console.log(error.message);
  }
};

const editAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    console.log("object_id:" + addressId);
    const addressDetails = await Address.findOne(
      { "address._id": addressId },
      { "address.$": 1 }
    );

    console.log("Address======" + addressDetails);

    if (!addressDetails) {
      console.error("Address not found for ID:", addressId);
      return res.status(404).send("Address not found for ID");
    }

    res.render("editAddress", { addressDetails });
  } catch (error) {
    console.log(error.message);
  }
};

const edit_Address = async (req, res) => {
  try {
    const addressId = req.query.addressId;
    const updatedAddressData = req.body;
    console.log("updated" + updatedAddressData);

    const result = await Address.findOneAndUpdate(
      { "address._id": addressId },
      { $set: { "address.$": updatedAddressData } },
      { new: true }
    );

    if (!result) {
      console.log("Address not found or not updated");
    }

    res.redirect("/profile?selected=Address");
  } catch (error) {
    console.log(error.message);
  }
};

const setDefault = async (req, res) => {
  try {
    console.log("default add");
    const { addressId } = req.params;

    console.log(addressId);

    const matchingAddress = await Address.findOneAndUpdate(
      { "address._id": addressId },
      { $set: { "address.$.type": "default" } },
      { new: true }
    );

    console.log(matchingAddress);

    if (matchingAddress) {
      res.json({
        success: true,
        message: "Address type set to default.",
      });
    } else {
      res.status(404).json({ error: "Address not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const deleteAddress=async(req,res)=>{
  try {

    console.log("in delete add");

    const userId=res.locals.currentUser._id;

     const addressId = req.query.addressId;

     console.log("user id:" + userId);

     console.log("address id:"+addressId);

    const updatedUser = await Address.findOneAndUpdate(
      { user: userId },
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }

}

module.exports = {
  addAddress,
  add_Address,
  editAddress,
  edit_Address,
  setDefault,
  deleteAddress,
};