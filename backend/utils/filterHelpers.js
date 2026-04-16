/**
 * Filter Helper for API endpoints
 * Provides consistent filtering functionality across all resources
 */

/**
 * Builds a MongoDB filter object based on query parameters
 * @param {Object} query - Query parameters from request
 * @param {Object} specificFilters - Resource-specific filter mappings
 * @returns {Object} MongoDB filter object
 */
const buildFilter = (query, specificFilters = {}) => {
    const filter = {};

    // Common filters for all resources
    
    // User ID filter
    if (query.userId) {
        filter.userId = query.userId;
    }

    // Date range filters
    if (query.dateMin || query.dateMax) {
        filter.date = {};
        if (query.dateMin) {
            filter.date.$gte = new Date(query.dateMin);
        }
        if (query.dateMax) {
            filter.date.$lte = new Date(query.dateMax);
        }
    }

    // Type filter (maps to different type fields based on resource)
    if (query.type && specificFilters.typeField) {
        filter[specificFilters.typeField] = query.type;
    }

    // Resource-specific filters
    Object.keys(specificFilters).forEach(key => {
        if (key !== 'typeField' && query[key]) {
            const fieldName = specificFilters[key];
            // Support for partial text matching on string fields
            if (typeof query[key] === 'string' && !query[key].match(/^[0-9a-fA-F]{24}$/)) {
                filter[fieldName] = { $regex: query[key], $options: 'i' };
            } else {
                filter[fieldName] = query[key];
            }
        }
    });

    return filter;
};

/**
 * Builds pagination and sorting options
 * @param {Object} query - Query parameters from request
 * @returns {Object} Options object for MongoDB query
 */
const buildQueryOptions = (query) => {
    const options = {};

    // Pagination
    const count = parseInt(query.count) || 10; // Default 10 items
    const page = parseInt(query.page) || 1;
    
    options.limit = Math.min(count, 100); // Max 100 items per request
    options.skip = (page - 1) * options.limit;

    // Sorting - default by date descending
    options.sort = { date: -1 };
    
    if (query.sortBy) {
        const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
        options.sort = { [query.sortBy]: sortDirection };
    }

    return options;
};

/**
 * Validates filter parameters
 * @param {Object} query - Query parameters from request
 * @returns {Object} Validation result with isValid and errors
 */
const validateFilters = (query) => {
    const errors = [];

    // Validate count
    if (query.count && (isNaN(query.count) || parseInt(query.count) <= 0)) {
        errors.push('count must be a positive number');
    }

    if (query.count && parseInt(query.count) > 100) {
        errors.push('count cannot exceed 100');
    }

    // Validate page
    if (query.page && (isNaN(query.page) || parseInt(query.page) <= 0)) {
        errors.push('page must be a positive number');
    }

    // Validate dates
    if (query.dateMin && isNaN(Date.parse(query.dateMin))) {
        errors.push('dateMin must be a valid date');
    }

    if (query.dateMax && isNaN(Date.parse(query.dateMax))) {
        errors.push('dateMax must be a valid date');
    }

    if (query.dateMin && query.dateMax && new Date(query.dateMin) > new Date(query.dateMax)) {
        errors.push('dateMin cannot be greater than dateMax');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Resource-specific filter configurations
 */
const FILTER_CONFIGS = {
    releases: {
        typeField: 'releaseType',
        subtitle: 'subtitle'
    },
    artists: {
        typeField: 'artistType',
        genre: 'genre'
    },
    events: {
        typeField: 'eventType',
        location: 'location'
    },
    studios: {
        typeField: 'studioType',
        location: 'location'
    },
    beats: {
        genre: 'genre',
        key: 'key'
    }
};

module.exports = {
    buildFilter,
    buildQueryOptions,
    validateFilters,
    FILTER_CONFIGS
};
