import axios from 'axios';
import cors from 'cors';
import express, {Request, Response} from 'express';
import { checkData, findHighestCountryProbability, parseNumber, classifyAge } from './checkData.js';
import { uuidv7 } from 'uuidv7';
import { Profile, saveProfile, getProfileByName, getProfileById, getAllProfiles, deleteProfile } from '../supabase.service.js';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (_req, res: Response) => {
  res.status(200).json({ message: 'Hello from Express!' });
})

app.post('/api/profiles', async (req: Request, res: Response) => {
  const name = req.body.name as string | undefined;

  if (!name) {
    return res.status(400).json({ status: "error", message: "Missing or empty name" });
  }

  if (typeof name !== 'string') {
    return res.status(422).json({ status: "error", message: "Invalid type" });
  }

  const cleanName = name.trim().replace(/[^a-zA-Z \-]/g, '');
  const cacheName = cleanName.toLowerCase();

  try {
    const dbProfile = await getProfileByName(cacheName);

    if (dbProfile) {
      return res.status(200).json({ 
        status: "success",
        message: "Profile already exists", 
        data: {...dbProfile, name: cleanName }
      });
    }

    const [genderResp, ageResp, natResp ] = await Promise.all([
      axios.get( `https://api.genderize.io?name=${encodeURIComponent(cleanName)}`, { timeout: 5000} ),
      axios.get( `https://api.agify.io?name=${encodeURIComponent(cleanName)}`, { timeout: 5000} ),
      axios.get( `https://api.nationalize.io?name=${encodeURIComponent(cleanName)}`, { timeout: 5000} )
    ]);


    const { gender, probability, count } = genderResp.data;
    const { age } = ageResp.data;
    const { country } = natResp.data;

    const checkDataResult = checkData(gender, count, age, country);

    if (!checkDataResult.status) {
      return res.status(502).json({ status: "error", message: `${checkDataResult.message} returned an invalid response` });
    }

    const sample_size = parseNumber(count);
    const ageValue = parseNumber(age);
    const prob = parseFloat(probability) || 0;
    const highestCountryProb = findHighestCountryProbability(country);

    if (isNaN(prob) || isNaN(sample_size) || isNaN(ageValue))  {
      return res.status(422).json({status: "error", message: "Invalid type" });
    }
    const ageGroup = classifyAge(ageValue);

    const profileData = {
      id: uuidv7(),
      name: cacheName,
      gender: gender,
      gender_probability: prob,
      sample_size: sample_size,
      age: ageValue,
      age_group: ageGroup,
      country_id: highestCountryProb.country_id,
      country_probability: highestCountryProb.probability,
      created_at: new Date().toISOString()
    };

   await saveProfile(profileData); 
    return res.status(201).json({ 
      status: "success",
      data: { ...profileData, name: cleanName }
    });

  } catch (error) {
    console.log('Error fetching data from external APIs:', error);
    return res.status(500).json({ status: "error", message: "Upstream or server failure"});
  }

})

// GET /api/profiles - Fetch all profiles
app.get('/api/profiles', async (req: Request, res: Response) => {
  try {
    const profiles = await getAllProfiles();
    
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ 
        status: "error", 
        message: "No profile found" 
      });
    }
    
    return res.status(200).json({ 
      status: "success",
      count: profiles.length,
      data: profiles 
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return res.status(500).json({ 
      status: "error", 
      message: "Failed to fetch profiles" 
    });
  }
});

// GET /api/profiles/{id} - Fetch a single profile by ID
app.get('/api/profiles/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or empty ID" 
    });
  }
  
  try {
    const profile = await getProfileById(id);
    
    if (!profile) {
      return res.status(404).json({ 
        status: "error", 
        message: "Profile not found" 
      });
    }
    
    return res.status(200).json({ 
      status: "success",
      data: profile 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ 
      status: "error", 
      message: "Upstream or server failure" 
    });
  }
});

// DELETE /api/profiles/{id} - Delete a profile by ID
app.delete('/api/profiles/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Profile ID is required" 
    });
  }
  
  try {
    // Check if profile exists first
    const profile = await getProfileById(id);
    if (!profile) {
      return res.status(404).json({ 
        status: "error", 
        message: "Profile not found" 
      });
    }
    
    // Delete the profile
    await deleteProfile(id);
    
    console.log(`Profile with ID ${id} deleted successfully`);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting profile:', error);
    return res.status(500).json({ 
      status: "error", 
      message: "Upstream or server failure" 
    });
  }
});


app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    status: "error", 
    message: "Route not found" 
  });
});


export default app
