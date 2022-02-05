const express = require('express');
const { emit, db } = require('../models/text');
const router = express.Router();

const textModel = require('../models/text');

// CRUD

async function getTextDocumentById(req, res, next){
    let textDocument;
    try {
        textDocument = await textModel.findById(req.params.textId).exec();
        if(textDocument == null){
            return res.status(404).json({error: 'Text does not exist'}); 
        }
    }
    catch(error) {
        return res.status((500)).json({error: error.message}); 
    }

    res.textDocument = textDocument;
    next();
}

router.post('/', async (req, res) => {
    //store text with a unique Id to the database.
    const textDocument = new textModel({
        content: req.body.content, 
    });
    try {
        const newTextDocument = await textDocument.save();
        return res.status(201).json(newTextDocument);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
});

router.get('/', async (req, res) => {
    // Fetch a list of text with the support of pagination.
    const results = {};
    
    const textCollectionLength = await textModel.countDocuments().exec();

    // Pagination settings (Default limit:0, page:1)
    const limit = req.query.limit ? parseInt(req.query.limit) : textCollectionLength;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if(endIndex < textCollectionLength){
        results.next = {
            page: page + 1,
            limit: limit
        }
    }
    if(startIndex >0){
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }

    try {
        const textDocuments = await textModel.find().limit(limit).skip(startIndex).exec();
        results.results = textDocuments;
        return res.json(results);
    } catch (err) {
        return res.status(500).json({ message: err.message});
    }
});

router.put('/:textId', getTextDocumentById, async (req, res) => {
    // Update text content.
    const { content } = req.body;
    if(content != null){
        res.textDocument.content = content;
    }
    try {
        const updatedTextDocument = await res.textDocument.save();
        return res.json(updatedTextDocument);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }

});


router.get('/:textId/count', getTextDocumentById, (req, res) => {
    // Fetch total word number of given a text
    let totalWordNumber = 0;
    // Iterate through available languages
    for (const [lang, content] of Object.entries(res.textDocument.content._doc)) {        
        totalWordNumber += content.trim().split(/\s+|^$/).length;
    }
    return res.json(totalWordNumber);
});

router.get('/:textId/count/:language', getTextDocumentById, (req, res) => {
    // Fetch total word number based on given text for specific languages ex: fr, ar, en
    let totalWordNumber = 0;
    const lang = req.params.language.toString();
    if(lang in res.textDocument.content._doc){
        totalWordNumber = res.textDocument.content._doc[lang].trim().split(/\s+|^$/).length;
        return res.json(totalWordNumber);
    }
    else{
        return res.status(400).json({error: 'Incorrect language'});
    }
});

router.get('/mostOccurrent', async (req, res) => {
    // Get the most recurrent word in the whole text database
    
    // Aggregation pipeline
    const wordModel = await textModel.aggregate([
        {
          $project: {
            content: {
              $concat: [
                "$content.ar",
                " ",
                "$content.fr",
                " ",
                "$content.en"
              ],
              
            }
          }
        },
        {
          $project: {
            content: {
              $split: [
                "$content",
                " "
              ]
            }
          }
        },
        // Unwind each element of the array into its own document
        {
          $unwind: "$content"
        },
        {
            $match: {
              content: {
                $not: {
                  $eq: ""
                }
              },
              
            }
        },
        // Group and count the total of each occurrence for each word
        {
          $group: {
            _id: "$content",
            count: {
              "$sum": 1
            }
          }
        },
        // Remove the id field from the response, rename it to the word
        {
          $project: {
            "_id": 0,
            "word": "$_id",
            "count": 1
          }
        },
        // Sort the results with highest occurrences first
        {
          $sort: {
            "count": -1
          }
        },
        {
          $limit: 1
        }
      ]).exec();

    res.json(wordModel);
});

// State management

router.post('/:textId/submit', getTextDocumentById, async (req, res) => {
    // Submit text
    // Get text's state
    let state = res.textDocument.state
    switch (state) {
        case 'draft':
        case 'rejected':
            const updatedTextDocument = await updateTextState(res.textDocument, 'submitted');
            return res.json(updatedTextDocument);
        default:
            return res.status(400).json({error: 'Illegal operation'});
    }

});

router.post('/:textId/reject', getTextDocumentById, async (req, res) => {
    // Reject text
    let state = res.textDocument.state
    switch (state) {
        case 'submitted':
            const updatedTextDocument = await updateTextState(res.textDocument, 'rejected');
            return res.json(updatedTextDocument);
        default:
            return res.status(400).json({error: 'Illegal operation'});
    }
});

router.post('/:textId/approve', getTextDocumentById, async (req, res) => {
    // Approve text
    let state = res.textDocument.state
    switch (state) {
        case 'submitted':
            const updatedTextDocument = await updateTextState(res.textDocument, 'approved');
            return res.json(updatedTextDocument);
        default:
            return res.status(400).json({error: 'Illegal operation'});
    }
});


async function updateTextState(textDocument, newState){
    textDocument.state = newState;
    try {
        const updatedTextDocument = await textDocument.save();
        return updatedTextDocument;
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}


module.exports = router;
