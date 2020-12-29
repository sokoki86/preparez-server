require("dotenv").config();
const knex = require("knex");
const RecipeServices = require("./recipes/recipe-service");
const RecipeService = require("./recipes/recipe-service");

const knexInstance = knex({
  client: "pg",
  connection: process.env.DB_URL,
});

RecipeServices.getAllRecipes(knexInstance)
  .then((recipes) => console.log(recipes))
  .then(() =>
    RecipeServices.insertRecipe(knexInstance, {
      recipe_name: "New recipe_name",
      recipe_preptime: "New recipe_preptime",
      recipe_ingredients: "New recipe_ingredients",
      recipe_instructions: "New recipe_instructions",
      category: "New category",
    })
  )
  .then(newRecipe => {
      console.log(newRecipe)
      return RecipeServices.updateRecipe(
          knexInstance,
          newRecipe.id,
          {
            recipe_name: "Updated recipe_name",
            recipe_preptime: "Updated recipe_preptime",
            recipe_ingredients: "Updated recipe_ingredients",
            recipe_instructions: "Updated recipe_instructions",
            category: "Updated category",
          }
      ).then(() => RecipeServices.getById(knexInstance, newRecipe.id))
  })
  .then(recipe => {
      console.log(recipe)
      return RecipeServices.deleteRecipe(knexInstance, recipe.id)
  })

console.log(RecipeService.getAllRecipes());
