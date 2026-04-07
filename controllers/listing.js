const Listing = require("../models/listing");
const axios = require("axios");

// 📍 INDEX
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// 📍 NEW FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// 📍 SHOW
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// 📍 CREATE (FINAL ✅)
module.exports.createlisting = async (req, res) => {
    try {
        let url = "";
        let filename = "";

        // 🖼️ Image
        if (req.file) {
            url = req.file.path;
            filename = req.file.filename;
        }

        // 🌍 MapTiler
        const location = req.body.listing.location;

        const geoRes = await axios.get(
            `https://api.maptiler.com/geocoding/${location}.json?key=${process.env.MAPTILER_KEY}`
        );

        if (!geoRes.data.features.length) {
            req.flash("error", "Invalid location");
            return res.redirect("/listings/new");
        }

        const coordinates = geoRes.data.features[0].geometry.coordinates;

        // 🏠 Create
        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = {
            type: "Point",
            coordinates: coordinates
        };

        await newListing.save();

        req.flash("success", "New Listing Created!");
        res.redirect(`/listings/${newListing._id}`);

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/listings/new");
    }
};

// 📍 EDIT FORM
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// 📍 UPDATE
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

// 📍 DELETE
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};

 module.exports.searchlisting = async (req, res) => {
    let { query } = req.query;

    if (!query) {
        return res.redirect("/listings");
    }

    let results = await Listing.find({
        $or: [
            { location: { $regex: query, $options: "i" } },
            { title: { $regex: query, $options: "i" } },
            
        ]
    });

    // ✅ If no result
    if (results.length === 0) {
        req.flash("error", "No listing found");
        return res.redirect("/listings");
    }

    // ✅ If found → redirect to first result
    res.redirect(`/listings/${results[0]._id}`);
};