import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetschema = new Schema({
    content: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true })

tweetschema.plugin(mongooseAggregatePaginate)

export const Tweet = mongoose.model("Tweet", tweetschema)