const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

app.use(bodyParser.json());

// const configuration = new Configuration({
//     apiKey: "", // Ensure you have set your API key in the environment variables
//   });
//   const openai = new OpenAIApi(configuration);
  const openai = new OpenAI({ apiKey: "" }); // Use your OpenAI API key here
  


  // list of features

  //1- Get the expenses with categorisation

  // 2- logic to get elibility of landings

  //2- Language converter to local language

// Enhanced sample mock data for bank statements with various expenses and income
const mockBankStatements = {
  userId123: [
    { date: '2024-01-01', amount: -50, description: "Grocery Store", category: "Groceries" },
    { date: '2024-01-03', amount: -120, description: "Electricity Bill", category: "Utilities" },
    { date: '2024-01-05', amount: 1500, description: "Monthly Salary", category: "Income" },
    { date: '2024-01-10', amount: -60, description: "Gas Station", category: "Transport" },
    { date: '2024-01-15', amount: -700, description: "Apartment Rent", category: "Rent" },
    { date: '2024-01-18', amount: -90, description: "Mobile Phone Bill", category: "Utilities" },
    { date: '2024-01-20', amount: -45, description: "Movie Tickets", category: "Entertainment" },
    { date: '2024-01-22', amount: -30, description: "Pharmacy", category: "Healthcare" },
    { date: '2024-01-25', amount: -20, description: "Book Store", category: "Education" },
    { date: '2024-01-28', amount: -100, description: "Restaurant", category: "Eating Out" },
    // Add more transactions as needed
  ],
  // Add more users as needed
};

// Middleware for authentication (simplified example)
app.use((req, res, next) => {
  // Implement OAuth2.0 token validation here
  next();
});

// Fetch bank statements
app.get('/api/bank-statements', (req, res) => {
  const { userId } = req.query;
  if (!userId || !mockBankStatements[userId]) {
    return res.status(404).json({ error: 'User not found or no statements available for this user' });
  }
  try {
    const transactions = mockBankStatements[userId];
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to categorize a list of expenses with amounts and suggest percentages
app.post('/api/categorize-expenses-with-amounts', async (req, res) => {
    const transactions = req.body.transactions; // Expecting an array of transactions
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of transactions is required' });
    }
  
    // Constructing a single prompt with all transaction descriptions and amounts
    const prompt = transactions.map((transaction, index) => 
      `Transaction ${index + 1}: ${transaction.description}, Amount: ${transaction.amount}. Categorize this expense and estimate the percentage of total spending:`).join("\n");
  
    try {
    //   const gptResponse = await openai.createCompletion({
    //     model: "text-davinci-003", // Update model as necessary
    //     prompt,
    //     temperature: 0.7, // Slightly higher temperature for creativity in responses
    //     max_tokens: (transactions.length * 100), // Adjust tokens based on the number of transactions
    //     top_p: 1.0,
    //     frequency_penalty: 0.0,
    //     presence_penalty: 0.0,
    //   });

      const gptResponse = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
      });
  
      // Parsing the model's response
      const responseLines = gptResponse.data.choices[0].text.trim().split("\n");
      
      // Assign categories and percentages to each transaction based on the response
      const categorizedTransactions = transactions.map((transaction, index) => {
        const responseParts = responseLines[index].split(","); // Assuming the model's response is "Category, Percentage: X%"
        return {
          ...transaction,
          category: responseParts[0].trim() || 'Uncategorized', // Default to 'Uncategorized' if no category found
          percentage: responseParts[1] ? responseParts[1].trim().match(/\d+/)[0] + '%' : '0%' // Extract percentage
        };
      });
  
      res.json(categorizedTransactions);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Categorize spending
// This endpoint can also use mock data to return spending habits based on the userId
app.get('/api/spending-habits', (req, res) => {
  const { userId } = req.query;
  // Implement logic to return mock spending habits data
  // This might involve filtering the mockBankStatements by userId and aggregating transactions by category
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
