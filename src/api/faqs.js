const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');

const db = monk(process.env.MONGO_URI);
const faqs = db.get('faqs');

const schema = Joi.object({
  question: Joi.string().trim().required(),
  answer: Joi.string().trim().required(),
  video_url: Joi.string().uri(),
});

const router = express.Router();

// Read all -> public
router.get('/', async (req, res, next) => {
  try {
    const item = await faqs.find({});
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// Read one -> public
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id
    });
    if (!item) return next();
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

// create one -> public
router.post('/', async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req.body);
    const inserted = await faqs.insert(value);
    res.json(inserted);
  } catch (error) {
    next(error);
  }
});

// update one -> public
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const value = await schema.validateAsync(req.body);
    const item = await faqs.findOne({
      _id: id
    });
    if (!item) return next();
    await faqs.update({ _id: id }, {
      $set: value
    });
    res.json(value);
  } catch (error) {
    next(error);
  }
});

// delete one -> public
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await faqs.remove({ _id: id });
    res.json({
      message: 'Success'
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
