import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';      


import { elements, renderLoader, clearLoader } from './views/base';

/** global state of the app
 * -search object
 * -current recipe object
 * -shopping list object
 * -liked recipes
 * 
 */

const state = {};
window.state = state;   

//SEARCH CONTROLLER

const controlSearch = async () => {
    // 1) GET QUERY FROM VIEW
    const query = searchView.getInput();
    //console.log(query);     // TODO

    if (query) {
        // 2)  New search object and add to state 
        state.search = new Search(query);

        // 3) Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
             // 4) Search for recipes 
        await state.search.getResults();

        // 5) render esults in the UI
        clearLoader();
        searchView.renderResults(state.search.result);

        }catch(err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});




elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})

// RECIPE CONTROLLER

const controlRecipe = async () => {

    //Get Id from URL
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight the sselected search item
        if(state.search) searchView.highlightSelected(id);

        //Create new recipe object
        state.recipe = new Recipe(id);

        try {
             //Get recipe data
            await state.recipe.getRecipe();
          //  console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcServings();
            state.recipe.calcTime();

            //Render the recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } 

        catch(err) {
            alert('Error processing recipe');
        }

       
    }
};

/*window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);
*/

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
 * LIST CONTROLLER
 */

 const controlList = () => {
     // Create a new list if there is no list 
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);  
        listView.renderItem(item);  
    });
 }


 // Handle delete and update list item events
 elements.shopping.addEventListener('click', e => {
     const id = e.target.closest('.shopping__item').dataset.itemid;

     // Handle delete button 
     if (e.target.matches('.shopping__delete , .shopping__delete *')){
         // Delete from state
         state.list.deleteItem(id);

         //Delete from UI
         listView.deleteItem(id); 
         
         //Handle the count update 
     } else if (e.target.matches('.shopping__count-value')){
         const val = parseFloat(e.target.value, 10);
         state.list.updateCount(id,val);
     }
 });

 /**
  *  LIKE CONTROLLLER
  */
 state.likes = new Likes();
 likesView.toggleLikeMenu(state.likes.getNumLikes());

  const controlLike = () => {
      if(!state.likes) state.likes = new Likes();
      const currentID = state.recipe.id;

      //User had Not yet liked current recipe 
      if (!state.likes.isLiked(currentID)) {
          //Add like to the state
          const newLike = state.likes.addLike(
              currentID,
              state.recipe.title,
              state.recipe.author,
              state.recipe.img
          )

          //Toggle the like button 
          likesView.toggleLikeBtn(true);

          //add like from UI
          likesView.renderLike(newLike);
    

      //User has liked the current recipe
      } else {
          // Remove like from the state
            state.likes.deleteLike(currentID);

          //Toggle the like but
          likesView.toggleLikeBtn(false);


          //Remove like from UI
        likesView.deleteLike(currentID);
      }

      likesView.toggleLikeMenu(state.likes.getNumLikes());
    };

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked

        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // Increase button is clicked 
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //Add ingredients to the shopping list
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }

   // console.log(state.recipe)
});


window.l = new List();