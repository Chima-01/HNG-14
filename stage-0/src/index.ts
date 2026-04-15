import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;
const validateGender = ['male', 'female'];

 
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Hello from Express on Vercel!' });
});

app.get('/api/classify', async (req: Request, res: Response) => {
  const name = req.query.name as string | undefined;

  if (!name) {
    return res.status(400).json({ status: "error", message: "Missing or empty name parameter" 
    });
  }
  let checkName = Array.isArray(name) ? String(name[0]) : String(name);
  checkName = checkName?.replace(/[^a-zA-Z \-]/g, '');
  
  if (typeof checkName !== 'string' || checkName.length === 0) {
    return res.status(422).json({ status: "error", message: "name is not a string" });
  }
  
  
  try {
    const response = await axios.get(
      `https://api.genderize.io?name=${encodeURIComponent(checkName)}`,
    { timeout: 5000 }
    );

    if (!response.data || typeof response.data !== 'object') {
      return res.status(502).json({ status: "error", message: "Upstream or server failure" });
    }
    const { gender, probability: prob, count } = response.data;

    const probability =  prob !== undefined ? parseFloat(prob) : 0;
    const sample_size = count !== undefined ? parseInt(count, 10) : 0;


  if (isNaN(probability) || isNaN(sample_size)) {
    return res.status(500).json({ 
    status: "error", 
    message: "No prediction available for the provided name" 
  });
}

    if (!validateGender.includes(gender) || sample_size === 0) {
      return res.status(404).json({ status: "error", "message": "No prediction available for the provided name"});
    }

    const is_confident = probability >= 0.7 && sample_size >= 100;

    return res.status(200).json({
      status: "success",
      data: {
        name: checkName,
        gender,
        probability,
        sample_size,
        is_confident,
        processed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.log("Error fetching data from genderize.io:", err);
  return res.status(500).json({ status: "error", message: "Upstream or server failure"});
  }
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    status: "error", 
    message: "Route not found" 
  });
});

 

app.listen(PORT, () => console.log(`Server ready on port ${PORT}.`));