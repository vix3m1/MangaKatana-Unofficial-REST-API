const axios = require("axios");
const cheerio = require ("cheerio");

const baseUrl = "https://mangakatana.com"

const getHotUpdates = async () => {
  try {
    

  const html = await axios.get(baseUrl, {headers: {
    "Content-Type": "text/html; charset=UTF-8"
  }});

  const $ = cheerio.load(html.data);

const hotUpdates = [];


const d = $("#hot_update > div > ul.slick_book > li > div");

d.each((_, element) => {
    const title = $(element).find("h3").text().trim();
  const latestChap = $(element).find("div > a").text().trim();
  const cover = $(element).find("div > a  > img").attr("src");
  
  const manga = {
    title,
    latest_chapter: latestChap,
    cover_img: cover
  }

  hotUpdates.push(manga)

  
});

  return hotUpdates;
      } catch (error) {
    console.log(error)
    throw {
      error: "An internal error occured!",
      status: error.response.status
    }
  }
}

const getChapters = async url => {
  
  
  try {
    const html = await axios.get(url, {headers: {
    "Content-Type": "text/html; charset=UTF-8"
  }});

  const $ = cheerio.load(html.data);

  const chapters = [];

  const el = $("div.chapters > table > tbody > tr > td")
  el.each((_, element) => {
    console.log
    const chapter = $(element).find("div.chapter > a").html();
    const chapterUrl = $(element).find("div.chapter > a").attr("href");
    chapters.push({chapter, chapter_url: chapterUrl})
  })

    
  return chapters
      } catch(e) {
    console.error(e)
    throw {
      error: "Internal error occurred!",
      status: e.response.status
    }
      }
}

const getSearch = async ({query, page, }) => {


  try {
  
  let default_url = `${baseUrl}/?search=${query}&search_by=book_name`
  if(page && parseInt(page) > 1) {
    default_url = `${baseUrl}/page/${page}?search=${query}&search_by=book_name`
  }

  const html = await axios.get(default_url, {headers: {
    "Content-Type": "text/html; charset=UTF-8"
  }});

  const $ = cheerio.load(html.data);

  const searchResult = [];
  const el = $("div#book_list > div");

  el.each(async (_, element) => {
    const title = $(element).find("div.text > h3.title > a").text().trim();
    const cover = $(element).find("div.wrap_img > a > img").attr("src");
    const status = $(element).find("div.status").text().trim();
    const synopsis = $(element).find("div.text > div.summary").text();
    const url = $(element).find("div.text > h3.title > a").attr("href");
    const genreEl = $(element).find("div.text > div.genres > a");
    const genres = [];

    genreEl.each((_, genre) => genres.push($(genre).text().trim()))

    const manga = {
      title,
      status,
      genre: genres.join(", "),
      synopsis,
      url,
      manga_cover: cover
    }

    searchResult.push(manga)
  })
  const pagesEl = $("div#book_list > ul.uk-pagination > li");
  const totalPages = parseInt(pagesEl.eq(pagesEl.length - 2).text()) || "Cannot determine.";


  const result = {query, current_page: page ? page : 1, total_pages: totalPages, data: searchResult};

  return result;
  } catch (error) {
    if(error.response && error.response.status === 404) {
      throw {
        error: "Oops! Looks like the manga/page you're looking for doesn't exist.",
        status: 404
      }
      
    } else {
      console.error(error)
      throw {
        error: "An internal error occurred!",
        status: error.response.status
      }
    }
  }
}

// meh, will continue
const getChapterImage = async chapterUrl => {
    try {
      
        const { data } = await axios.get(chapterUrl);
        
        const $ = cheerio.load(data);
        
        const scriptTags = $('script');
        let thzqValue = null;

        scriptTags.each((index, element) => {
            const scriptContent = $(element).html();
          
            const match = scriptContent.match(/thzq\s*=\s*(\[[^\]]*\]);/);
            if (match) {
                thzqValue = match[1]
                return false; 
            }
        });

      const parsedImages = eval(thzqValue);
        
        const chapterImages = parsedImages.map((image,index) => {
          return {
            chapter_num: index + 1,
            chapter_image: decodeURI(image)
            }
        })

      return chapterImages
    } catch (error) {
        console.error(error)
      throw {
        error: "An internal error occurred!",
        status: error.response.status
      }
    }
}


module.exports = {
  getHotUpdates,
  getSearch,
  getChapters,
  getChapterImage
}