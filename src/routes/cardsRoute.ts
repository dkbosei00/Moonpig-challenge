import * as express from "express";
import axios, {AxiosResponse} from "axios";
import { Card, Page, Template, Size } from "../interfaces";

const router = express.Router()

const urls: string[] = ["https://moonpig.github.io/tech-test-node-backend/cards.json",
"https://moonpig.github.io/tech-test-node-backend/templates.json",
"https://moonpig.github.io/tech-test-node-backend/sizes.json"
]

router.get('/cards', async (req, res) => {
    // Endpoint to respond with a list of cards
    
    try {
     // Make parallel requests to fetch cardData and templateData using axios.all
      const [cardData, templateData] = await axios.all(urls.map((url) => axios.get(url))) as [AxiosResponse<Card[], any>, AxiosResponse<Template[], any>]

      // Check if data was successfully retrieved from the responses
      if(!cardData || !templateData){
        return res.status(400).json({message: "No data found."})
      }
  
      // Process the cardData to build a response, mapping over each card's title, id, and pages
      const response = cardData.data.map(({title, id, pages}) => {
        
        // Find the templateId of the "Front Cover" from the card's pages
        const {templateId} = pages.find(({title}) => title === "Front Cover")

        // Find the corresponding imageUrl from the templateData using the templateId
        const {imageUrl} =  templateData.data.find(({id}) => id === templateId)
  
        // Return an object with the card title, imageUrl, and a URL path for the card
        return {
          title,
          imageUrl,
          url: `/cards/${id}`
        }
      })
  
      // Send the processed response as JSON
      return res.json(response)
  
    } catch (error) {
      // Return a 400 status with a generic error message
      res.status(400).json({message: "There was an error."})
    }
  })

router.get('/cards/:cardId/:sizeId?', async (req, res) => {
    // Endpoint to respond with card details by ID (with optional size)

    // Extract cardId and optional sizeId from the request parameters
    const {cardId, sizeId} = req.params
    
    try {
        // Make parallel requests to fetch cardData, templateData, and sizesData using axios.all
        const [cardData, templateData, sizesData] = await axios.all(urls.map((url) => axios.get(url))) as [AxiosResponse<Card[], any>, AxiosResponse<Template[], any>, AxiosResponse<Size[], any>]

        // Check if data was successfully retrieved from the responses
        if(!cardData || !templateData || !sizesData){
            return res.status(400).json({message: "No data found."})
          }
    
          // Find the card by its ID in cardData
        const card: Card = cardData.data.find(({id}) => id === cardId)
    
        // If the card with the provided cardId is not found, return a 404 error
        if (!card){
        return res.status(404).json({message: "Card Not Found"})
        }
        
        // Destructure the necessary fields from the card object
        const {title, pages, basePrice, sizes} = card 
        
        // Map over the card's available sizes and fetch corresponding size details from sizesData
        const availableSizes = sizes.map((size) => {
            // Find size details by ID
            const {id, title} = sizesData.data.find(({id})=> id === size)
            // Return the size ID and title
            return {id, title}
        })
    
        // Find the templateId for the "Front Cover" page of the card
        const {templateId} = pages.find(page => page.title === "Front Cover")
        // Find the image URL of the template from templateData using the templateId
        const {imageUrl} =  templateData.data.find(({id}) => id === templateId)
    
        let price: number

        // If a sizeId is provided and it is included in the card's available sizes, calculate the price
        if (sizeId && sizes.includes(sizeId)){

            // Calculate the final price based on the base price and multiplier
            const {priceMultiplier} = sizesData.data.find(({id}) => id === sizeId)
            price = basePrice * priceMultiplier
        }

        // Map over the pages of the card and get their width, height, and imageUrl from templateData
        const pagesData = pages.map(({title, templateId}) => {
            const {width, height, imageUrl} = templateData.data.find((({id}) => id === templateId))
            
            // Return page details
            return {title, width, height, imageUrl}
        })
    
        // Build the response object with card details
        const response = {
            title,
            size: sizeId ? (sizes.includes(sizeId) ? sizeId : "Size does not exist") : null,
            availableSizes,
            imageUrl,
            price: price ? `£${(price/100).toFixed(2)}` : `£${(basePrice/100).toFixed(2)}`, // Display the price (either the base price or the adjusted price)
            pages: pagesData
        }
    
        return res.status(200).json(response)
    
    } catch (error) {
        // Return a generic error message
        res.status(400).json({ message: "There was an error." }); 
    }
  
  })


export default router