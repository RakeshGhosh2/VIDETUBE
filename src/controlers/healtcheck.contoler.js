import { apiresponce } from "../utils/Apiresponce.js";
import { asynchandler } from "../utils/asynchandeler.js";

const healthcheck = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(new apiresponce(200, "ok", "healthcheck passed"))
})

export { healthcheck }