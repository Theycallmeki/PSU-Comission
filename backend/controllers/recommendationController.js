const recommendationService = require('../services/recommendationService');

const getRecommendations = async (req, res) => {
  try {
    const { school_year } = req.query;
    const recommendations = await recommendationService.generateRecommendations(school_year);
    res.json(recommendations);
  } catch (err) {
    console.error('Recommendation engine error:', err.message);
    res.status(500).json({ msg: 'Failed to generate recommendations', error: err.message });
  }
};

module.exports = {
  getRecommendations,
};
