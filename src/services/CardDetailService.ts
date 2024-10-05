import axios, { AxiosResponse } from "axios";
import { Card, Template, Size } from "../interfaces";

export async function getCardDetail(urls: string[], cardId: string, sizeId?: string) {
  // Make parallel requests to fetch cardData, templateData, and sizesData using axios.all
  const [cardData, templateData, sizesData] = await axios.all(urls.map((url) => axios.get(url))) as [AxiosResponse<Card[], any>, AxiosResponse<Template[], any>, AxiosResponse<Size[], any>];

  // Check if data was successfully retrieved from the responses
  if (!cardData || !templateData || !sizesData) {
    throw new Error("No data found.");
  }

  // Find the card by its ID in cardData
  const card: Card = cardData.data.find(({ id }) => id === cardId);

  // If the card with the provided cardId is not found, throw an error
  if (!card) {
    throw new Error("Card Not Found");
  }

  // Destructure the necessary fields from the card object
  const { title, pages, basePrice, sizes } = card;

  // Map over the card's available sizes and fetch corresponding size details from sizesData
  const availableSizes = sizes.map((size) => {
    // Find size details by ID
    const { id, title } = sizesData.data.find(({ id }) => id === size);
    // Return the size ID and title
    return { id, title };
  });

  // Find the templateId for the "Front Cover" page of the card
  const { templateId } = pages.find(page => page.title === "Front Cover");
  // Find the image URL of the template from templateData using the templateId
  const { imageUrl } = templateData.data.find(({ id }) => id === templateId);

  let price: number;

  // If a sizeId is provided and it is included in the card's available sizes, calculate the price
  if (sizeId && sizes.includes(sizeId)) {
    // Calculate the final price based on the base price and multiplier
    const { priceMultiplier } = sizesData.data.find(({ id }) => id === sizeId);
    price = basePrice * priceMultiplier;
  }

  // Map over the pages of the card and get their width, height, and imageUrl from templateData
  const pagesData = pages.map(({ title, templateId }) => {
    const { width, height, imageUrl } = templateData.data.find((({ id }) => id === templateId));
    
    // Return page details
    return { title, width, height, imageUrl };
  });

  // Build the response object with card details
  return {
    title,
    size: sizeId ? (sizes.includes(sizeId) ? sizeId : "Size does not exist") : null,
    availableSizes,
    imageUrl,
    price: price ? `£${(price / 100).toFixed(2)}` : `£${(basePrice / 100).toFixed(2)}`, // Display the price (either the base price or the adjusted price)
    pages: pagesData
  };
}