import * as express from "express";
import { getCardList } from "../services/CardListService";
import { getCardDetail } from "../services/CardDetailService";
const router = express.Router();
const urls = ["https://moonpig.github.io/tech-test-node-backend/cards.json",
    "https://moonpig.github.io/tech-test-node-backend/templates.json",
    "https://moonpig.github.io/tech-test-node-backend/sizes.json"
];
router.get('/cards', async (req, res) => {
    // Endpoint to respond with a list of cards
    try {
        const response = await getCardList(urls);
        // Send the processed response as JSON
        return res.json(response);
    }
    catch (error) {
        res.status(400).json({ message: error.message || "There was an error." });
    }
});
router.get('/cards/:cardId/:sizeId?', async (req, res) => {
    // Endpoint to respond with card details by ID (with optional size)
    // Extract cardId and optional sizeId from the request parameters
    const { cardId, sizeId } = req.params;
    try {
        const response = await getCardDetail(urls, cardId, sizeId);
        return res.status(200).json(response);
    }
    catch (error) {
        if (error.message === "Card Not Found") {
            // If the card with the provided cardId is not found, return a 404 error
            return res.status(404).json({ message: "Card Not Found" });
        }
        // Return a generic error message
        res.status(400).json({ message: "There was an error." });
    }
});
export default router;
