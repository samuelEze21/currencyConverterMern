require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require("express-rate-limit")
const PORT = process.env.PORT || 5010; 
const app = express(); 

const API_URL = 'https://v6.exchangerate-api.com/v6/'
const API_KEY = process.env.EXCHANGE_RATE_API_KEY

const apiLimiter = rateLimit({
    windowMs: 15 * 6 * 1000, // 15 minutes
    max: 100, 
})

const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'https://currency-converter-mern.vercel.app', // Deployed frontend
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  };

  
// // cors options
// const corsOptions = {
//     origin:['https://currency-converter-mern.vercel.app', 'http://localhost:5173'],
//     methods: ['GET', 'POST', 'OPTIONS'], // Explicitly allow methods
//     allowedHeaders: ['Content-Type'],
//     credentials: true 
// }



//middlewares
app.use(cors(corsOptions));
app.use(express.json()) // pass incoming data 
app.use(apiLimiter); 



// conversion 
app.post('/api/convert', async (req, res) => {
    
    try{
    const {from, to, amount}    = req.body; 
    console.log({from, to, amount});

    if(!from || !to || !amount){
        return res.status(400).json({message: "Missing required fields"});
    }

    const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${amount}`;
    console.log('API URL: ', url);

    const response = await axios.get(url);
    console.log('API Response: ', response.data);
    
    if (response.data && response.data.result === "success"){ 
        res.json({
            base: from, 
            target: to,
            conversionRate: response.data.conversion_rate,
            convertedAmount: response.data.conversion_result,
        });
    }else {
        res.status(400).json({message: "Error converting currency", details: response.data});
    }

    }catch(error){
        console.error('Error in /api/convert:', error.message)
        res.status(500).json({message: "Error converting currency", details: error.message});
    }
});

// start the server 
app.listen(PORT, console.log(`server is running on PORT ${PORT}`));



