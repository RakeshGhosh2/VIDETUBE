import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const subscriptionschema = new Schema({
    Subscription: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },

}, { timestamps: true })

subscriptionschema.plugin(mongooseAggregatePaginate)

export const Subscription = mongoose.model("Subscription", subscriptionschema)