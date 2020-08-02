const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());
app.use(express.json());

morgan.token("entry", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

app.use(
  morgan(":method :url :status :res[content-length] :response-time ms :entry")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const messageContent = `<p>Phonebook has info for ${
    persons.length
  } people</p><p>${new Date()}</p>`;
  res.send(messageContent);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = persons.find((item) => (item.id = id));
  if (result) {
    res.json(result);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((item) => item.id !== id);
  res.status(204).end();
});

const generatePostId = () =>
  Math.floor(Math.random() * 10000 + persons.length + 1);

app.post("/api/persons/", (req, res) => {
  const data = req.body;
  const id = generatePostId();

  if (!data.name) {
    return res.status(400).json({ error: "Name is missing" });
  } else if (!data.number) {
    return res.status(400).json({ error: "Number is missing" });
  } else if (persons.some((item) => item.name === data.name)) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const newEntry = {
    name: data.name,
    number: data.number,
    id: id,
  };

  persons = persons.concat(newEntry);

  res.json(newEntry);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

morgan(":method :url :status :res[content-length] - :response-time ms");

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
