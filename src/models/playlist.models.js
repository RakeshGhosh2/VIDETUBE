import mongoose, { Schema } from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playlistschema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,

    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true })

playlistschema.plugin(mongooseAggregatePaginate)

export const Playlist = mongoose.model("Playlist", playlistschema)