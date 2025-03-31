import prisma from "../../prisma/middleware.js"
import asyncHandler from "./../middleware/asyncHandler.js";
import fs from "fs";
import path from "path";

export const testFunction = asyncHandler(async (req, res) => {
  res.send("test");
});

/**
 * @desc   Create a new news article
 * @route  POST /api/news
 * @access Public
 */
export const createNews = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      content,
      author,
      province,
      tags,
      categoryId
    } = req.body;
    const images = req.files["images"]?.map((file) => file.path);
    const videos = req.files["videos"]?.map((file) => file.path);
    const tagsArray = tags || [];

    // Create the news item
    const newNews = await prisma.news.create({
      data: {
        title,
        content,
        author,
        province: String(province),
        tags: tagsArray,
        categoryId: Number(categoryId)
      },
    });


    const newMedia = await prisma.media.create({
      data: {
        images,
        videos,
        newsId: newNews.id,
      },
    });

    // Return the newly created news with related category and media
    const result = await prisma.news.findUnique({
      where: {
        id: newNews.id
      },
      include: {
        category: true, // Include the related category
        media: true, // Include the related media
      },
    });

    res.json({
      success: true,
      message: "News created successfully",
      data: result, // Return the full news object including category and media
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create news item",
    });
  }
});


export const updateNews = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    author,
    province,
    tags,
    categoryId,
    oldVideos = [],
    oldImages = [],
  } = req.body;

  const images = req.files?. ["images"]?.map((file) => file.path) || [];
  const videos = req.files?. ["videos"]?.map((file) => file.path) || [];
  const newsId = req.params.newsId;
  console.log(newsId);


  const news = await prisma.news.findUnique({
    where: {
      id: Number(newsId)
    },
    include: {
      category: true,
      media: true,
    },
  });

  if (!news) {
    return res.status(404).json({
      success: false,
      message: "News not found"
    });
  }

  // Update news details
  await prisma.news.update({
    where: {
      id: Number(newsId)
    },
    data: {
      title,
      content,
      author,
      province,
      tags: tags,
      categoryId: Number(categoryId),
    }
  })

  // Filter out removed images (those not present in oldImages)
  const filteredImages = news.media.images.filter((item) => oldImages.includes(item));
  const finalImages = [...filteredImages, ...images]; // Keep filtered + new ones

  // Filter out removed videos (those not present in oldVideos)
  const filteredVideos = news.media.videos.filter((item) => oldVideos.includes(item));
  const finalVideos = [...filteredVideos, ...videos]; // Keep filtered + new ones

  // Identify images and videos to delete
  const deletedImages = news.media.images.filter((item) => !oldImages.includes(item));
  const deletedVideos = news.media.videos.filter((item) => !oldVideos.includes(item));

  // Helper function to delete files
  const deleteFiles = (files) => {
    files.forEach((filePath) => {
      const fullPath = path.join(process.cwd(), filePath);
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error(`Failed to delete file: ${fullPath}`, err);
        }
      });
    });
  };

  // Delete the removed images and videos
  if (deletedImages.length) deleteFiles(deletedImages);
  if (deletedVideos.length) deleteFiles(deletedVideos);

  // Update media records in database
  await prisma.media.update({
    where: {
      newsId: Number(newsId)
    },
    data: {
      images: finalImages,
      videos: finalVideos
    }
  })

  const result = await prisma.news.findUnique({
    where: {
      id: Number(newsId)
    },
    include: {
      category: true,
      media: true,
    },
  });


  return res.status(200).json({
    success: true,
    message: "News updated successfully",
    data: result
  });
});

export const deleteNews = asyncHandler(async (req, res) => {
  const {
    newsId
  } = req.params;

  try {
    const news = await prisma.news.findUnique({
      where: {

        id: Number(newsId)
      },
      include: {
        media: true,
      }
    });
    if (!news) {
      return res
        .status(404)
        .json({
          success: false,
          message: "News not found"
        });
    }

    // Helper function to delete files
    const deleteFiles = (files) => {
      files.forEach((filePath) => {
        const fullPath = path.join(process.cwd(), filePath);
        fs.unlink(fullPath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error(`Failed to delete file: ${fullPath}`, err);
          }
        });
      });
    };

    // Delete images and videos if they exist
    if (news.media?.images?.length) {
      deleteFiles(news.media.images);
    }
    if (news.media?.videos?.length) {
      deleteFiles(news.media.videos);
    }

    await prisma.media.delete({
      where: {
        newsId: Number(newsId),
      }
    })

    await prisma.news.delete({
      where: {
        id: Number(newsId),
      }
    });



    res.json({
      success: true,
      message: "News removed successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to remove news item"
      });
  }
});


export const getNewsDetails = asyncHandler(async (req, res) => {
  const id = req.params.newsId;
  console.log(id);
  const news = await prisma.news.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      media: true,
      category: true,
    }
  });
  if (!news) {
    res.status(404);
    throw new Error("News not found");
  } else {
    return res.json({
      success: true,
      data: news,
    });
  }
});

export const getAllNews = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = 30;
  const searchKeyword = req.query.keyword;

  // Construct the keyword filter for Prisma
  const keywordFilter = searchKeyword ? {
    OR: [{
        title: {
          contains: searchKeyword,
          mode: "insensitive", // Case-insensitive search
        },
      },
      {
        content: {
          contains: searchKeyword,
          mode: "insensitive",
        },
      },
    ],
  } : {};

  // Count total news articles matching the filter
  const count = await prisma.news.count({
    where: keywordFilter,
  });

  // Fetch paginated news articles
  const news = await prisma.news.findMany({
    where: keywordFilter,
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: pageSize * (pageNumber - 1),
    include: {
      media: true,
      category: true,
    },
  });

  if (!news || news.length === 0) {
    return res.status(404).json({
      success: false,
      message: "News not found",
    });
  }

  return res.status(200).json({
    success: true,
    meta: {
      page: pageNumber,
      pages: Math.ceil(count / pageSize),
    },
    data: news,
  });
});


export const searchNews = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = Number(process.env.PAGINATION_LIMIT) || 8;
  const searchKeyword = req.query.keyword;

  // Construct keyword filter for Prisma
  const keywordFilter = searchKeyword ? {
    OR: [{
        title: {
          contains: searchKeyword,
          mode: "insensitive", // Case-insensitive search
        },
      },
      {
        content: {
          contains: searchKeyword,
          mode: "insensitive",
        },
      },
    ],
  } : {};

  // Construct date filter
  let dateFilter = {};
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
  const toDate = req.query.toDate ? new Date(req.query.toDate) : null;
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  if (fromDate && !isNaN(fromDate.getTime())) {
    dateFilter.createdAt = {
      gte: fromDate,
      lte: toDate && !isNaN(toDate.getTime()) ? toDate : today,
    };
  } else if (toDate && !isNaN(toDate.getTime())) {
    const startOfDay = new Date(toDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(toDate);
    endOfDay.setHours(23, 59, 59, 999);
    dateFilter.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  // Combine filters
  const filterConditions = {
    ...keywordFilter,
    ...dateFilter,
  };

  // Count total matching news
  const count = await prisma.news.count({
    where: filterConditions,
  });

  // Fetch paginated news articles
  const news = await prisma.news.findMany({
    where: filterConditions,
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: pageSize * (pageNumber - 1),
    include: {
      media: true,
      category: true,
    },
  });

  return res.status(200).json({
    success: true,
    page: pageNumber,
    pages: Math.ceil(count / pageSize),
    data: news,
  });
});


// Function to get news articles by category with pagination and keyword search
const getNewsByCategory = (category) => {
  return asyncHandler(async (req, res) => {
    console.log(category);

    const pageNumber = Number(req.query.pageNumber) || 1;
    const pageSize = Number(process.env.PAGINATION_LIMIT) || 8;
    const searchKeyword = req.query.keyword;

    // Construct keyword filter for Prisma
    const keywordFilter = searchKeyword ? {
      OR: [{
          title: {
            contains: searchKeyword,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          content: {
            contains: searchKeyword,
            mode: "insensitive",
          },
        },
      ],
    } : {};

    // Construct category filter
    const categoryFilter = {
      category: {
        name: category
      }
    };

    // Combine filters
    const filterConditions = {
      AND: [categoryFilter, keywordFilter],
    };

    // Count total matching news
    const count = await prisma.news.count({
      where: filterConditions,
    });

    // Fetch paginated news articles
    const news = await prisma.news.findMany({
      where: filterConditions,
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize,
      skip: pageSize * (pageNumber - 1),
      include: {
        media: true,
        category: true,
      },
    });

    if (!news.length) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    return res.status(200).json({
      success: true,
      meta: {
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
      },
      data: news,
    });
  });
};


// Exporting the controllers for different categories
export const getNewsByPolitics = getNewsByCategory("politics");

export const getNewsByNepaliBrand = getNewsByCategory("nepalbrand");

export const getNewsByMarkeyEconomy = getNewsByCategory("market");

export const getNewsBySociety = getNewsByCategory("social");

export const getNewsByArt = getNewsByCategory("art");

export const getNewsBySports = getNewsByCategory("sports");

export const getNewsByBlog = getNewsByCategory("blog");

export const getNewsByGlobal = getNewsByCategory("global");

export const getNewsByIdea = getNewsByCategory("idea");

export const getNewsByProvince = asyncHandler(async (req, res) => {
  const pageNumber = Number(req.query.pageNumber) || 1;
  const pageSize = 7;
  const province = req.query.province?.trim(); // Trim whitespace if present

  // If no province is provided, return an empty response
  if (!province) {
    return res.status(200).json({
      success: true,
      page: pageNumber,
      pages: 0,
      data: [],
    });
  }

  // Define filter criteria (case-insensitive search)
  const filterConditions = {
    province: {
      contains: province,
      mode: "insensitive", // Case-insensitive search
    },
  };

  // Count total documents matching the criteria
  const count = await prisma.news.count({
    where: filterConditions,
  });

  // Fetch the news articles with pagination
  const news = await prisma.news.findMany({
    where: filterConditions,
    orderBy: {
      createdAt: "desc",
    },
    take: pageSize,
    skip: pageSize * (pageNumber - 1),
    include: {
      media: true,
      category: true,
    },
  });

  return res.status(200).json({
    success: true,
    meta: {
      page: pageNumber,
      pages: Math.ceil(count / pageSize),
    },
    data: news,
  });
});


export const similarNews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the news article by ID
  const news = await prisma.news.findUnique({
    where: { id: Number(id) },
    select: { categoryId: true }, // Fetch only categoryId for filtering
  });

  if (!news) {
    return res.status(404).json({ message: "News not found" });
  }

  // Fetch similar news articles based on categoryId (excluding the current news)
  const similarNews = await prisma.news.findMany({
    where: {
      categoryId: news.categoryId, // Use categoryId for filtering
      id: { not: Number(id) }, // Exclude the current article
    },
    orderBy: { createdAt: "desc" },
    take: 10, // Limit to 10 similar articles
    include: {
      media: true,
      category: true,
    },
  });

  if (!similarNews.length) {
    return res.status(200).json({ success: false, message: "No similar news found", data: [] });
  }

  res.status(200).json({
    success: true,
    data: similarNews,
  });
});
