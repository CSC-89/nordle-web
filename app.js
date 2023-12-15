const PORT = 8000
const express = require('express');
const ejs = require('ejs')
const axios = require("axios").default;
const cors = require('cors');
require('dotenv').config();

let app = express()

app.use(cors())
app.set('view engine', 'ejs')
app.use(express.static("public"))


app.get('/word', (req, res) => {

  var options = {
    method: 'GET',
    url: 'https://random-words5.p.rapidapi.com/getMultipleRandom',
    params: {count: '5', wordLength: '5'},
    headers: {
      'x-rapidapi-host': 'random-words5.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY
    }
  };

  axios.request(options).then((response) => {
    res.json(response.data[0])
    console.log(response.data);
  }).catch((error) => {
    console.error(error);
  });
})

/// Dictionary API

app.get('/check', (req, res) => {
  const word = req.query.word;
  var options = {
    method: 'GET',
    url: 'https://twinword-word-graph-dictionary.p.rapidapi.com/association/',
    params: {entry: word},
    headers: {
      'x-rapidapi-host': 'twinword-word-graph-dictionary.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPID_API_KEY
    }
  };
  
  axios.request(options).then((response) => {
    console.log(response.data);
    res.json(response.data.result_msg)
  }).catch((error) => {
    console.error(error);
  });
})
///



app.get('/', (req, res) => {
  res.render('index')
})

app.listen(PORT, () => {
  console.log("App running on Port", PORT )
} )