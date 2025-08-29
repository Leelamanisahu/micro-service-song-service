import express from "express";
import {
  getAllAlbum,
  getAllSongs,
  getAllsongsOfAlbum,
  getSongById,
} from "../controller/songController.js";

const songRouter = express.Router();

songRouter.get("/songs/all", getAllSongs);
songRouter.get("/albums/all", getAllAlbum);
songRouter.get("/albums/:id", getAllsongsOfAlbum);
songRouter.get("/songs/:id", getSongById);

export default songRouter;
