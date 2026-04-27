import 'dotenv/config';
import axios from 'axios';
import { supabase } from './supabase.js';
import { uuidv7 } from 'uuidv7';


// const JSON_URL = "https://drive.google.com/file/d/1Up06dcS9OfUEnDj_u6OV_xTRntupFhPH/view";
const fileID = "1Up06dcS9OfUEnDj_u6OV_xTRntupFhPH";
const URL = `https://drive.google.com/uc?export=download&id=${fileID}`;

async function populateDatabaseFromURL(jsonUrl: string) {
  try {
    // 1. Fetch the JSON file from the link
    console.log("Fetching data...");
    const response = await axios.get(jsonUrl);
    const { profiles = [] } = response.data;
    console.log(`Fetched ${profiles.length} records...}`);

    if (!Array.isArray(profiles)) {
      throw new Error("JSON data is not an array. Check your file structure.");
    }

    // 2. Batching Logic (to handle large files efficiently)
    const chunkSize = 500; 
    for (let i = 0; i < profiles.length; i += chunkSize) {
      const registerChunk = profiles.slice(i, i + chunkSize).map(profile => ({
        ...profile,
        id: uuidv7(), 
      }));


      console.log(`Inserting rows ${i} to ${i + registerChunk.length}...`);
      
      // 3. Insert into Supabase
      const { error } = await supabase
        .from('profiles')
        .insert(registerChunk); // Supabase handles array input as a bulk insert

      if (error) {
        console.error("Insert Error:", error?.message || error);
        return;
      }
    }

    console.log("Database population complete!");

  } catch (err) {
    console.log("Workflow failed:", err);
  }
}

// Usage
populateDatabaseFromURL(URL);