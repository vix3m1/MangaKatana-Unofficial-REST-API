const express = require ("express");
const app = express();
const port = 3000;
app.use(express.json());
const parser = require("./parser.js")

app.get("/hot-update", async (_,res) => {
  try {
    const data = await parser.getHotUpdates();

    res.status(200).json(data);
  } catch (error) {
    res.status(error.status).json(error)
  }
})

app.get("/search", async (req,res) => {
  const {query,page} = req.query;
  try {
    if(!query) throw {
      error: "No search query provided!",
      status: 400
      
    }
    const result = await parser.getSearch({query, page})

    res.status(200).json(result)
  } catch (error) {
    res.status(error.status).json(error)
  }
})

app.get("/get-chapters", async (req,res) => {
  const {manga_url} = req.query;
  if(!manga_url) res.status(400).json({error: "No manga url provided"})
  try {
    const chapters = await parser.getChapters(manga_url)
  } catch (e) {
    res.status(e.status).json(e);
  }
})

app.get("/fetch-image", async (req,res) => {
  const {chapter_url} = req.query;
  if(!manga_url) return res.status(400).json({error: "No chapter url provided!"})
  try {
    const images = await parser.getChapterImage(chapter_url)
  } catch (e) {
    console.error(e)
    res.status(e.status).json(e)
  }
})

app.listen(port, () => console.log("Running at port 3000"))