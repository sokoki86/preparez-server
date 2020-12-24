const { expect } = require("chai");
const { default: contentSecurityPolicy } = require("helmet/dist/middlewares/content-security-policy");
const knex = require("knex");
const supertest = require("supertest");
const app = require("../src/app");
const recipesRouter = require("../src/recipes/recipe-router");
const { makeTestRecipesArray, makeMaliciousRecipe } = require("./recipes.fixtures");

describe("Recipe Endpoints", function () {
  let db

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    })
    app.set("db", db);
  })
  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("recipe_table").truncate());

  afterEach("cleanup", () => db("recipe_table").truncate());

  describe(`GET /recipes`, () => {
    context(`Given no recipes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/recipes").expect(200, []);
      })
    })
    context("Given there are recipes in the database", () => {
      const testRecipes = makeTestRecipesArray();

      beforeEach("insert recipes", () => {
        return db.into("recipe_table").insert(testRecipes);
      })
      it("responds with 200 and all of the articles", () => {
        return supertest(app).get("/recipes").expect(200, testRecipes);
      })
    })
    context(`Given an XSS attack recipe`, () => {
      const { maliciousRecipe, expectedRecipe } = makeMaliciousRecipe()

      beforeEach("insert malicious recipe", () => {
        return db.into("recipe_table").insert([maliciousRecipe]);
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/recipes`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].recipe_name).to.eql(expectedRecipe.recipe_name);
            expect(res.body[0].recipe_ingredients).to.eql(expectedRecipe.recipe_ingredients);
          })
      })
    })
  })

  describe(`GET /recipes/:recipe_id`, () => {
    context(`Given no articles`, () => {
      it(`responds with 404`, () => {
        const recipeId = 123456;
        return supertest(app)
          .get(`/recipes/${recipeId}`)
          .expect(404, { error: { message: `Recipe doesn't exist` } })
      })
    })
    context("Given there are recipes in the database", () => {
        const testRecipes = makeTestRecipesArray();

      beforeEach("insert recipes", () => {
        return db.into("recipe_table").insert(testRecipes);
      })

      it("responds with 200 and the specified recipe", () => {
        const recipeId = 2;
        const expectedRecipe = testRecipes[recipeId - 1];
        return supertest(app)
          .get(`/recipes/${recipeId}`)
          .expect(200, expectedRecipe);
      })
    })
      context(`Given an XSS attack recipe`, () => {
        const { maliciousRecipe, expectedRecipe } = makeMaliciousRecipe()

        beforeEach("insert malicious recipe", () => {
          return db.into("recipe_table").insert([ maliciousRecipe ])
        })

        it("removes XSS attack content", () => {
          return supertest(app)
            .get(`/recipes/${maliciousRecipe.recipe_id}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.recipe_name).to.eql(expectedRecipe.recipe_name);
              expect(res.body.recipe_instructions).to.eql(expectedRecipe.recipe_instructions);
            })
        })
      })
    })
  describe(`POST /recipes`, () => {
    it(`creates a recipe, responding with 201 and the new recipe`, function () {
      const newRecipe = {
        recipe_name: "test new recipe",
        recipe_preptime: "14 minutes",
        recipe_ingredients: "Bologna, Cheese, Mayonaise",
        recipe_instructions: "Assemble between 2 pieces of bread",
        category: "Snacks",
      };
      return supertest(app)
        .post("/recipes")
        .send(newRecipe)
        .expect(201)
        .expect((res) => {
          expect(res.body.recipe_name).to.eql(newRecipe.recipe_name)
          expect(res.body.recipe_preptime).to.eql(newRecipe.recipe_preptime)
          expect(res.body.recipe_ingredients).to.eql(
            newRecipe.recipe_ingredients
          );
          expect(res.body.recipe_instructions).to.eql(
            newRecipe.recipe_instructions
          );
          expect(res.body.category).to.eql(newRecipe.category)
          expect(res.body).to.have.property("recipe_id")
          expect(res.headers.location).to.eql(`/recipes/${res.body.recipe_id}`)
        })
        .then((res) =>
          supertest(app)
            .get(`/recipes/${res.body.recipe_id}`)
            .expect(res.body)
        )
    })
    const requiredFields = [
      "recipe_name",
      "recipe_preptime",
      "recipe_ingredients",
      "recipe_instructions",
      "category",
    ]

    requiredFields.forEach((field) => {
      const newRecipe = {
        recipe_name: "Bologna Sandwich",
        recipe_preptime: "2 minutes",
        recipe_ingredients: "Bologna, Cheese, Mayonaise",
        recipe_instructions: "Assemble between 2 pieces of bread",
        category: "Snacks",
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newRecipe[field];

        return supertest(app)
          .post("/recipes")
          .send(newRecipe)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
    it('removes XSS attack content from response', () => {
        const {maliciousRecipe, expectedRecipe} = makeMaliciousRecipe()
        return supertest(app)
        .post(`/recipes`)
        .send(maliciousRecipe)
        .expect(201)
        .expect(res => {
            expect(res.body.recipe_name).to.eql(expectedRecipe.recipe_name)
            expect(res.body.recipe_instructions).to.eql(expectedRecipe.recipe_instructions)
        })
    })
  })
  describe(`DELETE /recipes/:recipe_id`, () => {
      context(`Given no recipes`, () => {
          it(`responds with 404`, () => {
              const recipeId = 123456
              return supertest(app)
              .delete(`/recipes/${recipeId}`)
              .expect(404, { error: { message: `Recipe doesn't exist`} })
          })
      })
      context('Given there are recipes in the database', () => {
         const testRecipes = makeTestRecipesArray()

         beforeEach('insert recipes', () => {
             return db
             .into('recipe_table')
             .insert(testRecipes)
         })

         it('responds with 204 and removes the recipe', () => {
             const idToRemove = 2
             const expectedRecipe = testRecipes.filter(recipes => recipes.recipe_id !== idToRemove)
             return supertest(app)
             .delete(`/recipes/${idToRemove}`)
             .expect(204)
             .then(res =>
                supertest(app)
                .get(`/recipes`)
                .expect(expectedRecipe)
                )
         })
      })
  })
})
