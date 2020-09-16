const saveConfirmedEl = document.querySelector('.save-confirmed');
const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const loader = document.querySelector('.loader');


// nasa api
const count = 10;
const apiKey = 'DEMO_KEY';
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
// [] --> {} : it will be easier to delete favorite items instead of having loop through and entire array
let favorites = {};

function showContent(page) {
    window.scrollTo({top: 0, behavior: "instant"});
    if (page === 'results'){
        resultsNav.classList.remove('hidden');
        favoritesNav.classList.add('hidden');
    }else {
        resultsNav.classList.add('hidden');
        favoritesNav.classList.remove('hidden');
    }
    loader.classList.add('hidden');
}

function createDOMNodes(page) {
    const currentArray = page === 'results' ? resultsArray : Object.values(favorites);
    // forEach method is working on arrays not object
    currentArray.forEach((result) => {
        // card container
        const card = document.createElement('div');
        card.classList.add('card');
        // link
        const link = document.createElement('a');
        link.href = result.hdurl;
        link.title = 'View Full Image';
        link.target = '_blank';
        // image
        const image = document.createElement('img');
        image.src = result.url;
        image.alt = 'Nasa Picture of the day';
        image.loading = 'lazy'; // we want these images to lazy load that as we scroll through, they loaded and they're not all loaded at once
        image.classList.add('card-image-top');
        // card body
        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        // card title
        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = result.title;
        // save text
        const saveText = document.createElement('p');
        saveText.classList.add('clickable');
        if (page === 'results') {
            saveText.textContent = 'Add to Favorites';
            saveText.setAttribute('onclick', `saveFavorite('${result.url}')`);
        } else {
            saveText.textContent = 'Remove Favorite';
            saveText.setAttribute('onclick', `removeFavorite('${result.url}')`);
        }
        // card text
        const cardText = document.createElement('p');
        cardText.textContent = result.explanation;
        // footer container
        const footer = document.createElement('small');
        footer.classList.add('text-muted');
        // date
        const date = document.createElement('strong');
        date.textContent = result.date;
        // copyright
        const copyrightResult = result.copyright === undefined ? '' : result.copyright;
        const copyRight = document.createElement('span');
        copyRight.textContent = `  ${copyrightResult}`;

        // Append (smallest to biggest) this is the part that you can order elements down to top
        footer.append(date, copyRight);
        cardBody.append(cardTitle, saveText, cardText, footer);
        link.appendChild(image);
        card.append(link, cardBody);
        imagesContainer.appendChild(card);
    });
}

function updateDOM(page) {
    // get favorites from localStorage
    if (localStorage.getItem('nasaFavorites')) {
        favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
    }
    // remove all elements that have been appended to the container previously
    imagesContainer.textContent = '';
    createDOMNodes(page);
    // remove loader and show content
    showContent(page);
}

// get 10 images from nasa api
async function getNasaPictures() {
    // show loader
    loader.classList.remove('hidden');
    try {
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        updateDOM('results');
    } catch (e) {
        // catch error here
        console.log(e);
    }
}

// resize save confirmed
function resizeSaveConfirmedEl() {
    let currentWidth = window.innerWidth;
    let x = (currentWidth - 260) / 2;
    saveConfirmedEl.style.left = `${x}px`;
}

// add result to favorites
function saveFavorite(itemUrl) {
    resizeSaveConfirmedEl();
    // loop through result array to select favorite
    resultsArray.forEach((item) => {
        if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
            //set favorite object with the key of itemUrl and creating an object within the object that has the key of itemUrl
            favorites[itemUrl] = item;
            console.log(JSON.stringify(favorites));
            // show save confirmation for 2 sec
            saveConfirmedEl.classList.remove("hidden");
            setTimeout(() => {
                saveConfirmedEl.classList.add("hidden");
            }, 2000);
            // set favorites in localStorage
            localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
        }
    });
}

// remove item from favorite
function removeFavorite(itemUrl) {
    if (favorites[itemUrl]) {
        delete favorites[itemUrl];
        // set favorites in localStorage
        localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
        updateDOM('favorites');
    }
}

// event listeners
window.addEventListener("resize", resizeSaveConfirmedEl);

// onload
getNasaPictures();