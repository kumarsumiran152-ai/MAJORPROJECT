const express = require("express");
const router = express.Router();      
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validatelisting} = require("../middleware.js")
const listingControllers = require("../controllers/listing.js");
const { route } = require("./user.js");
const multer = require("multer")
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })
  // ADD THIS LINE
  const {listingSchema} = require("../schema.js");  // Remove 's'
const ExpressError = require("../utils/ExpressError.js");


const validateListing = (req,res,next) => {
    let{error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message)
.join(".");
return next(new ExpressError(400,errMsg));
    } else {
        next();
}
};

router.get("/search", wrapAsync(listingControllers.searchlisting));

router.route("/")
.get(wrapAsync(listingControllers.index))
.post(isLoggedIn,
    upload.single("listing[image]"), 
     validateListing,
    wrapAsync(listingControllers.createlisting))


    router.get("/search", wrapAsync(listingControllers.searchlisting));


router.get("/new" ,  isLoggedIn,listingControllers.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingControllers.showListing))
.put( isLoggedIn,isOwner,upload.single("listing[image]"), 
     wrapAsync(listingControllers.updateListing)
)
.delete(isLoggedIn,isOwner, wrapAsync(listingControllers.destroyListing))

//edit
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingControllers.renderEditForm));

module.exports = router;