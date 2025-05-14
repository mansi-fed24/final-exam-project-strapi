'use strict';

module.exports = {
  async afterCreate(event) {
    await updateAverageRating(event.result.book);
  },
  async afterUpdate(event) {
    await updateAverageRating(event.result.book);
  },
  async afterDelete(event) {
    // On delete, event.result.book may not be available, so fetch book ID manually
    const ratingId = event.result?.id || event.params.where.id;
    if (!ratingId) return;

    const rating = await strapi.db.query('api::rating.rating').findOne({
      where: { id: ratingId },
      select: ['book'],
    });

    await updateAverageRating(rating?.book);
  },
};

async function updateAverageRating(bookId) {
  if (!bookId) return;

  // Find all ratings for the book
  const ratings = await strapi.db.query('api::rating.rating').findMany({
    where: { book: bookId },
  });

  if (ratings.length === 0) {
    // No ratings, set average_rating to 0
    await strapi.db.query('api::book.book').update({
      where: { id: bookId },
      data: { average_rating: 0 },
    });
    return;
  }

  // Calculate average rating
  const total = ratings.reduce((acc, r) => acc + r.rating, 0);
  const avg = total / ratings.length;

  // Update book with new average_rating
  await strapi.db.query('api::book.book').update({
    where: { id: bookId },
    data: { average_rating: avg },
  });
}
// This lifecycle hook will update the average rating of a book whenever a rating is created, updated, or deleted.
// It calculates the average rating by fetching all ratings for the book and updating the book's average_rating field.
// This lifecycle hook will update the average rating of a book whenever a rating is created, updated, or deleted.
// It calculates the average rating by fetching all ratings for the book and updating the book's average_rating field.