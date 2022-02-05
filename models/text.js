const mongoose = require('mongoose');

const ContentSchema = mongoose.Schema({
    ar: {
        type: String,
        required: true,
        trim: true
    },
    fr: {
        type: String,
        required: true,
        trim: true
    },
    en: {
        type: String,
        required: true,
        trim: true
    },
    _id: false,
    id: false
  });
  
const TextSchema = mongoose.Schema({
    state: {
        type: String,
        enum : ['draft', 'submitted', 'rejected', 'approved'],
        required: true,
        default: 'draft'
    },
    content: {
        type: ContentSchema,
        required: true
    },
}, 
{
    timestamps: true
}
);


module.exports = mongoose.model('text', TextSchema);
