import prisma from "../../prisma/middleware.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    try {
        const category = await prisma.category.create({
            data: {
                name: req.body.name,
            }
        })
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error creating category",
        })

    }
})
export const updateCategory = asyncHandler(async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const category = await prisma.category.update({
            where: {
                id: Number(id)
            },
            data: {
                name: req.body.name,
            }
        })

        res.status(201).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error creating category",
        })

    }
})
export const deleteCategory = asyncHandler(async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const category = await prisma.category.delete({
            where: {
                id: Number(id)
            }
        })

        res.status(201).json({
            success: true,
            message: "Category deleted successfully",
            data: category
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error creating category",
        })

    }
})

export const getCategory = asyncHandler(async (req, res) => {
    try {
        const pageNumber = Number(req.query.pageNumber) || 1;
        const pageSize = 7;
        const searchKeyword = req.query.keyword || "";

        const filterConditions = {
            name: {
                contains: searchKeyword,
                mode: "insensitive",
            },
        };

        const count = await prisma.category.count({
            where: filterConditions
        });

        const categories = await prisma.category.findMany({
            where: filterConditions,
            orderBy: {
                createdAt: "desc"
            },
            take: pageSize,
            skip: pageSize * (pageNumber - 1),
        });

        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            meta: {
                page: pageNumber,
                pages: Math.ceil(count / pageSize),
                total: count,
            },
            data: categories, // Fixed variable name
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching categories",
        });
    }
});