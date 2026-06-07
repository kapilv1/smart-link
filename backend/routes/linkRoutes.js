const express = require("express");

const { connectDB } = require("../config/db");
const { toObjectId } = require("../utils/userUtils");
const getUserFromHeader = require("../middleware/authMiddleware");

const router = express.Router();

async function checkProfilePermission(req, res, profileId) {
    const db = await connectDB();

    const profile = await db.collection("profiles").findOne({
        _id: profileId,
    });

    if (!profile) {
        res.status(404).json({ error: "Profile not found" });
        return null;
    }

    if (
        req.user.role !== "manager" &&
        profile.userId.toString() !== req.user._id.toString()
    ) {
        res.status(403).json({ error: "No permission for this profile" });
        return null;
    }

    return profile;
}

router.get("/:profileId/links", getUserFromHeader, async (req, res) => {
    try {
        const profileId = toObjectId(req.params.profileId);

        if (!profileId) {
            return res.status(400).json({ error: "Invalid profile ID" });
        }

        const profile = await checkProfilePermission(req, res, profileId);
        if (!profile) return;

        const db = await connectDB();

        const links = await db
            .collection("links")
            .find({ profileId })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(links);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/:profileId/links", getUserFromHeader, async (req, res) => {
    try {
        const { links } = req.body;
        const profileId = toObjectId(req.params.profileId);

        if (!profileId) {
            return res.status(400).json({ error: "Invalid profile ID" });
        }

        if (!Array.isArray(links)) {
            return res.status(400).json({ error: "links must be an array" });
        }

        const profile = await checkProfilePermission(req, res, profileId);
        if (!profile) return;

        const db = await connectDB();

        const docs = links.map((link) => ({
            profileId,
            url: link.url,
            type: link.type,
            searchEngine: link.searchEngine,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        let savedCount = 0;

        try {
            const result = await db.collection("links").insertMany(docs, {
                ordered: false,
            });

            savedCount = result.insertedCount;
        } catch (err) {
            if (err.code !== 11000 && !err.writeErrors) {
                throw err;
            }

            savedCount = err.result?.result?.nInserted || 0;
        }

        res.status(201).json({
            message: "Links saved",
            savedCount,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/:profileId/check-links", getUserFromHeader, async (req, res) => {
    try {
        const { links } = req.body;
        const profileId = toObjectId(req.params.profileId);

        if (!profileId) {
            return res.status(400).json({ error: "Invalid profile ID" });
        }

        if (!Array.isArray(links)) {
            return res.status(400).json({ error: "links must be an array" });
        }

        const profile = await checkProfilePermission(req, res, profileId);
        if (!profile) return;

        const db = await connectDB();

        const unavailable = [];
        const available = [];

        for (const link of links) {
            const exists = await db.collection("links").findOne({
                profileId,
                type: link.type,
                searchEngine: link.searchEngine,
            });

            if (exists) {
                unavailable.push(link);
            } else {
                available.push(link);
            }
        }

        res.json({ available, unavailable });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/:profileId/links/all", getUserFromHeader, async (req, res) => {
    try {
        const profileId = toObjectId(req.params.profileId);

        if (!profileId) {
            return res.status(400).json({ error: "Invalid profile ID" });
        }

        const profile = await checkProfilePermission(req, res, profileId);
        if (!profile) return;

        const db = await connectDB();

        const result = await db.collection("links").deleteMany({ profileId });

        res.json({
            message: "All links deleted successfully.",
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;