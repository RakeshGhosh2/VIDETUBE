import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeschema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'

    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    },
    likeby: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

}, { timestamps: true })

likeschema.plugin(mongooseAggregatePaginate)

export const Like = mongoose.model("Like", likeschema)