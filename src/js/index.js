import Search from './models/Search';
import * as searchView from './views/searchView'
import { elements, renderLoader, clearLoader } from './views/base';

/** global state of the app
 * -search object
 * -current recipe object
 * -shopping list object
 * -liked recipes
 * 
 */

const state = {};

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

        // 4) Search for recipes 
        await state.search.getResults();

        // 5) render esults in the UI
        clearLoader();
        searchView.renderResults(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    console.log(e.target);
})

