const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("DB connected");

    const listings = await Listing.find({});

    for (let listing of listings) {
            try {
                const res = await axios.get(
                    `https://api.maptiler.com/geocoding/${listing.location}.json?key=knirh76vp8QAQ6nMGLgx`
                );

                if (res.data.features.length) {
                    const coords = res.data.features[0].geometry.coordinates;

                    listing.geometry = {
                        type: "Point",
                        coordinates: coords
                    };

                    await listing.save();
                    console.log(`✔ Updated: ${listing.title}`);
                }
            } catch (err) {
                console.log(`❌ Failed: ${listing.title}`);
            }
        }
    }

    mongoose.connection.close();


main();