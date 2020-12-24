function  makeTestRecipesArray() { 
    return  [
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
} 
function makeMaliciousRecipe() {
    const maliciousRecipe = {
      recipe_id: 911,
      recipe_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      recipe_preptime: 'How-to',
      recipe_ingredients: 'carrots',
      recipe_instructions: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      category: "Snacks"

    }
    const expectedRecipe = {
      ...maliciousRecipe,
      recipe_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      recipe_instructions: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousRecipe,
      expectedRecipe,
    }
  }
  
  module.exports = {
    makeTestRecipesArray,
    makeMaliciousRecipe,
  }
