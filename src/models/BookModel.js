const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const playSchema = new Schema({
    title: { type: String, required: [true, 'Title is required'], minlength: [2, 'Title must be at least 2 characters long'] },
    author: { type: String, required: [true, 'Author is required'], minlength: [5, 'Author must be at least 5 characters long']},
    genre: { type: String, required: true, minlength: [5, 'Genre must be at least 5 characters long']},
    stars: { type: Number, required: true, min: [1, 'Stars must be between 1 and 5' ], max: [5, 'Stars must be between 1 and 5']},
    image: {
        type: String, required: true, validate: {
            validator(value) {
                return URL_PATTERN.test(value);
            },
            message: 'Image must be a valid URL'
        }
    },
    review: { type: String, required: true, minlength: [10, 'Review must be at least 10 characters long']},
    usersWished: { type: [ObjectId], ref: 'User', default: [] },
    owner: { type: ObjectId, ref: 'User' }
});


const Book = model('Book', playSchema);

module.exports = Book;