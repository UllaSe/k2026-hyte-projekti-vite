import { fetchData } from './fetch.js';

// Render Item in a List in the UI
/////////////////////
const renderFruitList = (items) => {
  console.log('Teen kohta listan');
  // Haetaan fruitlist UL
  const list = document.querySelector('.fruitlist');
  list.innerHTML = '';

  console.log(items);

  items.forEach((item) => {
    console.log(item.name);
    let li = document.createElement('li');
    li.textContent = `Hedelmän id ${item.id} ja nimi ${item.name}`;
    list.appendChild(li);
  });

  // ja lisätään loopissa kaikki yksittäiset
  // hedelmät listaan
};

// GEt items
/////////////////////

const getItems = async () => {
  const items = await fetchData('http://localhost:3000/api/items');

  // jos BE puolelta tulee virhe niin informoidaan
  // joko consoleen tai käyttäjälle virheestä

  if (items.error) {
    console.log(items.error);
    return;
  }

  // tai jatketaan jä tehdään datalle jotain
  // items.forEach((item) => {
  //   console.log(item.name);
  // });

  renderFruitList(items);
};

export { getItems };
