import { Router } from "express";

import { healthcheck } from "../controlers/healtcheck.contoler.js";

const router = Router()

router.route("/").get(healthcheck)

export default router