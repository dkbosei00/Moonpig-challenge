import axios, { AxiosResponse } from "axios";
import { Card, Template } from "../interfaces";

export async function getCardList(urls: string[]) {
  // Make parallel requests to fetch cardData and templateData using axios.all
  const [cardData, templateData] = await axios.all(urls.slice(0, 2).map((url) => axios.get(url))) as [AxiosResponse<Card[], any>, AxiosResponse<Template[], any>];

  // Check if data was successfully retrieved from the responses
  if (!cardData || !templateData) {
    throw new Error("No data found.");
  }

  // Process the cardData to build a response, mapping over each card's title, id, and pages
  return cardData.data.map(({ title, id, pages }) => {
    // Find the templateId of the "Front Cover" from the card's pages
    const { templateId } = pages.find(({ title }) => title === "Front Cover");

    // Find the corresponding imageUrl from the templateData using the templateId
    const { imageUrl } = templateData.data.find(({ id }) => id === templateId);

    // Return an object with the card title, imageUrl, and a URL path for the card
    return {
      title,
      imageUrl,
      url: `/cards/${id}`
    };
  });
}