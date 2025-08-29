import { sql } from "../config/db.js";
import { redisClient } from "../index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllAlbum = asyncHandler(async (req, res) => {
  let albums;
  const CACH_EXPIRY = 1800;

  if (redisClient.isReady) {
    albums = await redisClient.get("albums");
  }

  if (albums) {
    console.log("Albums fetched from cache");
    res.json(JSON.parse(albums));
    return;
  } else {
    albums = await sql`SELECT * FROM albums`;
    if (redisClient.isReady) {
      await redisClient.set("albums", JSON.stringify(albums), {
        EX: CACH_EXPIRY,
      });
    }
  }
  res.json(albums);
  return;
});

export const getAllSongs = asyncHandler(async (req, res) => {
  let songs;

  const CACH_EXPIRY = 1800;

  if (redisClient.isReady) {
    songs = await redisClient.get("songs");
  }

  if (songs) {
    console.log("Songs fetched from cache");
    res.json(JSON.parse(songs));
    return;
  } else {
    songs = await sql`SELECT * FROM songs`;
    if (redisClient.isReady) {
      await redisClient.set("songs", JSON.stringify(songs));
    }
  }

  res.json(songs);
  return;
});

export const getAllsongsOfAlbum = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let CACH_EXPIRY = 1800;
  let album, songs;

  if (redisClient.isReady) {
    const cacheData = await redisClient.get(`album_songs_${id}`);
    if (cacheData) {
      console.log("Album songs fetched from cache");
      res.json(JSON.parse(cacheData));
      return;
    }
  }

  album = await sql`SELECT * FROM albums WHERE id = ${id}`;

  if (album.length === 0) {
    res.status(404).json({ message: "Album not found" });
    return;
  }

  songs = await sql`SELECT * FROM songs WHERE album_id = ${id}`;

  const response = { songs, album: album[0] };

  if (redisClient.isReady) {
    await redisClient.set(`album_songs_${id}`, JSON.stringify(response), {
      EX: CACH_EXPIRY,
    });
  }
  res.json(response);
});

export const getSongById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let song;
  song = await sql`SELECT * FROM songs WHERE id = ${id}`;
  if (song.length === 0) {
    res.status(404).json({ message: "Song not found" });
    return;
  }
  res.json(song[0]);
  return;
});
