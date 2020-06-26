import Search from './models/Search';

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
    const query = 'pizza' // TODO

    if (query) {
        // 2)  New search object and add to state 
        state.search = new Search(query);

        // 3) Prepare UI for the results

        // 4) Search for recipes 
        await state.search.getResults();

        // 5) render esults in the UI
        console.log(state.search.result)
    }
}

document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})

