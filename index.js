const mongoose  = require("mongoose")
mongoose.connect("mongodb://localhost:27017/OffsideOutfits");

const express = require("express");
const app=express();

app.listen(3000,function(){
console.log("Server is Running.... http://localhost:3000/");
});
