const express = require("express");
const router = express.Router({mergeParams:true});      
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");
const { reviewSchema } = require("../schema.js");

const reviewControllers = require("../controllers/review.js");
const review = require("../models/review.js");
const validateReview= (req,res,next) => {
    let{error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message)
.join(".");
return next(new ExpressError(400,errMsg));
    } else {
        next();
}
};

router.post("/", isLoggedIn, validateReview,
    wrapAsync(reviewControllers.createReview)
      );

router.delete(
    "/:reviewId",isLoggedIn,isReviewAuthor,
    wrapAsync(reviewControllers.destroyReview)
);

module.exports = router;