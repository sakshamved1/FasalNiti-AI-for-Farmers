const Location = require('../models/Location');
const { INDIAN_STATES_AND_DISTRICTS } = require('../data/locationMaster');

/**
 * GET /api/locations/states
 * Returns list of all Indian States and Union Territories from MongoDB Atlas
 */
const getStates = async (req, res) => {
  try {
    const { q } = req.query;

    let query = { active: true };
    if (q && q.trim()) {
      query.state = { $regex: q.trim(), $options: 'i' };
    }

    let dbStates = await Location.find(query).sort({ state: 1 }).lean();

    // If locations not yet seeded in MongoDB Atlas, fallback to master array
    let states = dbStates.length > 0
      ? dbStates.map(s => ({
          id: s.stateCode,
          name: s.state,
          type: s.type,
          districtCount: (s.districts || []).length
        }))
      : INDIAN_STATES_AND_DISTRICTS.map(s => ({
          id: s.id,
          name: s.name,
          type: s.type,
          districtCount: s.districts.length
        }));

    if (q && q.trim() && dbStates.length === 0) {
      const search = q.trim().toLowerCase();
      states = states.filter(s => s.name.toLowerCase().includes(search));
    }

    res.json({
      success: true,
      source: 'MongoDB Atlas',
      count: states.length,
      data: states
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/locations/states/:stateId/districts
 * Returns all official districts for a specific state or UT from MongoDB Atlas
 */
const getDistrictsByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const { q } = req.query;

    if (!stateId) {
      return res.status(400).json({ success: false, message: 'State identifier is required.' });
    }

    const normalizedId = stateId.trim().toLowerCase().replace(/\s+/g, '-');

    // Query MongoDB Atlas Location collection
    let stateDoc = await Location.findOne({
      $or: [
        { stateCode: normalizedId },
        { state: { $regex: `^${stateId.trim()}$`, $options: 'i' } }
      ]
    }).lean();

    // Fallback to static catalog if DB record not found
    if (!stateDoc) {
      const fallbackState = INDIAN_STATES_AND_DISTRICTS.find(s => 
        s.id === normalizedId || s.name.toLowerCase() === stateId.trim().toLowerCase()
      );
      if (fallbackState) {
        stateDoc = {
          state: fallbackState.name,
          stateCode: fallbackState.id,
          districts: fallbackState.districts
        };
      }
    }

    if (!stateDoc) {
      return res.status(404).json({
        success: false,
        message: `State '${stateId}' not found in official Indian master dataset.`
      });
    }

    let districts = (stateDoc.districts || []).map(d => ({
      name: d,
      state: stateDoc.state,
      stateId: stateDoc.stateCode
    }));

    if (q && q.trim()) {
      const search = q.trim().toLowerCase();
      districts = districts.filter(d => d.name.toLowerCase().includes(search));
    }

    districts.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      success: true,
      source: 'MongoDB Atlas',
      state: stateDoc.state,
      stateId: stateDoc.stateCode,
      count: districts.length,
      data: districts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStates,
  getDistrictsByState
};
