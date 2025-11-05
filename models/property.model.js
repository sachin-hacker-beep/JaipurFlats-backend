import mongoose from "mongoose";
const propertySchema = new mongoose.Schema({
    id: {type: Number, required: true},

    email: {type: String, required: true},
    type: {type: String, required: true},
    price: {type: Number, required: true},
    address: {type: String, required: true},
    bedrooms: {type: Number, required: true},
    bathrooms: {type: Number, required: true},
    area: {type: Number, required: true},
    floor: {type: Number, required: true},
    parking: {type: String, required: true},
    image: {type: String, required: true},
    UserId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}
}, { strict: true });

export const Property = mongoose.model("Property", propertySchema, "Properties");