import { Router } from "express";

import { registeruser, logoutuser, loginuser, refreshaccesstoken, changecurrentpassword, getcurrentuser, getuserchannelprofile, updateaccountdetails, updateuseravater, updateusercoverimage, getwatchhistory } from "../controlers/user.controler.js";

import { upload } from "../middlerwares/multer.middlewares.js"

import { verifyjwt } from "../middlerwares/auth.middlewares.js";

const router = Router()

router.post(
    "/register",
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverimage", maxCount: 1 }
    ]),
    registeruser
)

router.route("/login").post( loginuser)
router.route("/refresh-token").post(refreshaccesstoken)
//sequre routes
router.route("/logout").post(verifyjwt, logoutuser)
router.route("/change-password").post(verifyjwt, changecurrentpassword)
router.route("/current-user").get(verifyjwt, getcurrentuser)
router.route("/c/:username").get(verifyjwt, getuserchannelprofile)
router.route("/update-account").patch(verifyjwt, updateaccountdetails)
router.route("/avater").patch(verifyjwt, upload.single("avatar"), updateuseravater)
router.route("/cover-image").patch(verifyjwt, upload.single("coverimage"), updateusercoverimage)
router.route("/history").get(verifyjwt, getwatchhistory)





export default router
