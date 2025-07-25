import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoschema = new Schema({
    videofile: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    tital: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number,
        required: true
    },
    ispublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }


}, { timestamps: true })

videoschema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoschema)