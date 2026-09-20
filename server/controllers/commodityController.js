/**
 * KisanSetu AI - Commodity Controller
 * Official reference commodity master from MongoDB Atlas.
 */

const Commodity = require('../models/Commodity');

/**
 * @desc Get all active commodities with optional filtering and pagination
 * @route GET /api/commodities
 * @access Public
 */
exports.getCommodities = async (req, res) => {
  try {
    const { category, search, active, page = 1, limit = 50 } = req.query;
    const query = {};

    if (active !== undefined) {
      query.active = active === 'true';
    } else {
      query.active = true;
    }

    if (category) {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aliases: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [commodities, total] = await Promise.all([
      Commodity.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Commodity.countDocuments(query)
    ]);

    res.json({
      success: true,
      source: 'MongoDB Atlas',
      count: commodities.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      data: commodities
    });
  } catch (error) {
    console.error('Error fetching commodities from Atlas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve commodities from database',
      error: error.message
    });
  }
};

/**
 * @desc Search commodities by name or local language alias
 * @route GET /api/commodities/search
 * @access Public
 */
exports.searchCommodities = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({
        success: true,
        source: 'MongoDB Atlas',
        count: 0,
        data: []
      });
    }

    const regex = new RegExp(q.trim(), 'i');
    const commodities = await Commodity.find({
      active: true,
      $or: [
        { name: { $regex: regex } },
        { aliases: { $regex: regex } },
        { category: { $regex: regex } }
      ]
    })
      .sort({ name: 1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      source: 'MongoDB Atlas',
      query: q,
      count: commodities.length,
      data: commodities
    });
  } catch (error) {
    console.error('Error searching commodities in Atlas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search commodities',
      error: error.message
    });
  }
};

/**
 * @desc Get single commodity by ID or slug
 * @route GET /api/commodities/:id
 * @access Public
 */
exports.getCommodityById = async (req, res) => {
  try {
    const { id } = req.params;
    let commodity = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      commodity = await Commodity.findById(id).lean();
    } else {
      commodity = await Commodity.findOne({ name: new RegExp(`^${id}$`, 'i') }).lean();
    }

    if (!commodity) {
      return res.status(404).json({
        success: false,
        message: 'Commodity not found'
      });
    }

    res.json({
      success: true,
      source: 'MongoDB Atlas',
      data: commodity
    });
  } catch (error) {
    console.error('Error fetching commodity detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve commodity',
      error: error.message
    });
  }
};

/**
 * @desc Get all distinct commodity categories
 * @route GET /api/commodities/categories
 * @access Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Commodity.distinct('category', { active: true });
    res.json({
      success: true,
      source: 'MongoDB Atlas',
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching commodity categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
};
