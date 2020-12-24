const RecipeServices = require("../src/recipes/recipe-service");
const knex = require("knex");
const { expect } = require("chai");

describe(`Recipes service object`, function () {
  let db;
  let testRecipes = [
    {
      recipe_id: 1,
      recipe_name: "Chicken Noodle Soup",
      recipe_preptime: "45 minutes",
      recipe_ingredients:
        "Carrots, Chicken broth, Chicken Breast, Celery, Salt, Pepper",
      recipe_instructions:
        "Boil chicken, and vegetables in a pot to create stock use this for your base",
      category: "Soups",
    },
    {
      recipe_id: 2,
      recipe_name: "Chicken Parmesean",
      recipe_preptime: "60 minutes",
      recipe_ingredients:
        " Chicken Breast, marinara, mozzarella cheese, Salt, Pepper",
      recipe_instructions:
        "Fry chicken and add marinara and mozzarella bake for 25 minutes ",
      category: "Dinner",
    },
    {
      recipe_id: 3,
      recipe_name: "Bologna Sandwich",
      recipe_preptime: "2 minutes",
      recipe_ingredients: "Bologna, Cheese, Mayonaise",
      recipe_instructions: "Assemble between 2 pieces of bread",
      category: "Snacks",
    },
  ];

  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.Test_DB_URL,
    });
  });
  before(() => db("recipe_table").truncate());

  afterEach(() => db("recipe_table").truncate());

  after(() => db.destroy());

  context(`Given 'recipe_table' has data`, () => {
    beforeEach(() => {
      return db.into("recipe_table").insert(testRecipes);
    });
    it(`getAllRecipes() resolves all recipes from 'recipe_table' table`, () => {
      return RecipeServices.getAllRecipes(db).then((actual) => {
        expect(actual).to.eql(testRecipes);
      });
    });
    it(`getById() resolves a recipe by recipe_id from 'recipe_table' table`, () => {
      const thirdId = 3;
      const thirdTestRecipe = testRecipes[thirdId - 1];
      return RecipeServices.getById(db, thirdId).then((actual) => {
        expect(actual).to.eql({
          recipe_id: thirdId,
          recipe_name: thirdTestRecipe.recipe_name,
          recipe_preptime: thirdTestRecipe.recipe_preptime,
          recipe_ingredients: thirdTestRecipe.recipe_ingredients,
          recipe_instructions: thirdTestRecipe.recipe_instructions,
          category: thirdTestRecipe.category,
        });
      });
    });
    it(`deleteRecipe() removes a recipe by id from 'recipe_table' table`, () => {
      const recipeId = 3;
      return RecipeServices.deleteRecipe(db, recipeId)
        .then(() => RecipeServices.getAllRecipes(db))
        .then((allRecipes) => {
          // copy the test articles array without the "deleted" article
          const expected = testRecipes.filter(
            (recipe) => recipe.recipe_id !== recipeId
          );
          expect(allRecipes).to.eql(expected);
        });
    });
    it(`updateRecipe() updates a recipe from the 'recipe_table' table`, () => {
      const idOfRecipeToUpdate = 3;
      const newRecipeData = {
        recipe_name: "updated recipe_name",
        recipe_preptime: "updated recipe_preptime",
        recipe_ingredients: "updated recipe_ingredients",
        recipe_instructions: "updated recipe_instructions",
        category: "Snacks",
      }
      return RecipeServices.updateRecipe(db, idOfRecipeToUpdate, newRecipeData)
      .then(() => RecipeServices.getById(db, idOfRecipeToUpdate))
      .then(recipe => {
          expect(recipe).to.eql({
              recipe_id: idOfRecipeToUpdate,
              ...newRecipeData
          })
      })
    });
  });
  context(`Given 'recipe_table' has no data`, () => {
    it(`getAllRecipes() resolves an empty array`, () => {
      return RecipeServices.getAllRecipes(db).then((actual) => {
        expect(actual).to.eql([]);
      });
    });

    it(`insertRecipe() inserts a new recipe and resolves the new recipe with an 'id'`, () => {
      const newRecipe = {
        recipe_name: "Sandwich",
        recipe_preptime: "2 minutes",
        recipe_ingredients: "Bologna, Cheese, Mayonaise",
        recipe_instructions: "Assemble between 2 pieces of bread",
        category: "Snacks",
      };
      return RecipeServices.insertRecipe(db, newRecipe).then((actual) => {
        expect(actual).to.eql({
          recipe_id: 1,
          recipe_name: newRecipe.recipe_name,
          recipe_preptime: newRecipe.recipe_preptime,
          recipe_ingredients: newRecipe.recipe_ingredients,
          recipe_instructions: newRecipe.recipe_instructions,
          category: newRecipe.category,
        });
      });
    });
  });
});
