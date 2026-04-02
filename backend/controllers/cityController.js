const City = require('../models/City');

const getCities = async (req, res) => {
  try {
    const cities = await City.find({});
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addCity = async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json(city);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getCities, addCity };
