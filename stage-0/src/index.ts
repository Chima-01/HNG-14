import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;

 
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Hello from Express on Vercel!' });
});

app.get('/api/classify', async (req: Request, res: Response) => {
  let name = req.query.name as string | undefined;

  if (!name) {
    return res.status(400).json({ status: "error", error: "Missing or empty name parameter" 
    });
  }

  name = name?.replace(/[^a-zA-Z]/g, '');
  
  if (typeof name !== 'string' || name.length === 0) {
    return res.status(422).json({ status: "error", error: "name is not a string" });
  }
  
  
  
  try {
    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(name)}`,
    { timeout: 500 }
    );

    if (!response.data || typeof response.data !== 'object') {
      return res.status(502).json({ status: "error", message: "Invalid response from upstream API" });
    }
    const { gender, probability: prob, count } = response.data;

    const probability =  prob !== undefined ? parseFloat(prob) : 0;
    const sample_size = count !== undefined ? parseInt(count, 10) : 0;
    const validateGender = ['male', 'female'];


    if (isNaN(probability) || isNaN(sample_size)) {
  return res.status(500).json({ 
    status: "error", 
    message: "Invalid data from gender API" 
  });
}

    if (!validateGender.includes(gender) || sample_size === 0) {
      return res.status(404).json({ status: "error", "message": "No prediction available for the provided name"});
    }

    const is_confident = probability >= 0.7 && sample_size >= 100;

    return res.status(200).json({
      status: "success",
      data: {
        name,
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at: new Date().toISOString()
      }
    });
  } catch (err) {
  return res.status(500).json({ status: "error", error: "Upstream or server failure"});
  }
});
 

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));