import express from "express";
import {
  createNews,
  updateNews,
  getNewsDetails,
  getAllNews,
  getNewsByPolitics,
  getNewsByMarkeyEconomy,
  getNewsByNepaliBrand,
  getNewsBySociety,
  getNewsByArt,
  getNewsBySports,
  getNewsByBlog,
  getNewsByGlobal,
  getNewsByIdea,
  deleteNews,
  searchNews,
  getNewsByProvince,
  similarNews,
} from "../controllers/newsController.js";
import { uploadMultiple } from "./uploadRoute.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { requireUser } from "./../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(uploadMultiple, createNews).get(getAllNews);

router
  .route("/updateNews/:newsId")
  .put( uploadMultiple, updateNews);

router.route("/searchnews").get(searchNews);

router.route("/politics").get(getNewsByPolitics);
router.route("/marketeconomy").get(getNewsByMarkeyEconomy);
router.route("/idea").get(getNewsByIdea);
router.route("/nepalibrand").get(getNewsByNepaliBrand);
router.route("/society").get(getNewsBySociety);
router.route("/art").get(getNewsByArt);
router.route("/sports").get(getNewsBySports);
router.route("/blog").get(getNewsByBlog);
router.route("/global").get(getNewsByGlobal);

// delete news
router.route("/:newsId").delete( deleteNews);

router.route("/detailnews/:newsId").get(getNewsDetails);

// get news by province
router.route("/province").get(getNewsByProvince);

router.route("/similar/:id").get(similarNews);

export default router;
