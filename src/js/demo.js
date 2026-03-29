import { fetchData } from './fetch.js';

const diaryContainer = document.querySelector('.diary-card-area');

// Dialog
/////////////////////////////

const dialog = document.querySelector('.diary_dialog');
const closeButton = document.querySelector('.diary_dialog button');
// "Close" button closes the dialog
closeButton.addEventListener('click', () => {
  dialog.close();
});

const getEntries = async (event) => {
  const url = 'http://localhost:3000/api/entries';
  let headers = {};
  let token = localStorage.getItem('token');
  console.log(token);
  if (token) {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  const options = {
    headers: headers,
  };

  const response = await fetchData(url, options);

  if (response.error) {
    console.error('Error login in:', response.error);
    return;
  }

  if (response.message) {
    console.log(response.message, 'success');
  }

  console.log(response);

  // Luodaan tässä lennossa tarvittavat kortit
  diaryContainer.innerHTML = '';

  response.forEach((entry) => {
    // Luodaan aina yksittäinen kortti per rivi eli entry
    console.log(entry);

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `<span>${entry.notes}</span>`;

    const cardDiary = document.createElement('div');
    cardDiary.classList.add('card-text');
    cardDiary.innerHTML = `
      <p><strong>Date:</strong> ${entry.entry_date}</p>
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p><strong>Weight:</strong> ${entry.weight} kg</p>
      <p><strong>Sleep:</strong> ${entry.sleep_hours} hours</p>
      <p><strong>Notes:</strong> ${entry.notes}</p>
    `;

    // Tähän tehdään dialogin avaus
    const openCard = document.createElement('button');
    openCard.classList.add('dialogButton');
    openCard.textContent = 'Avaa Dialogissa';

    // 🔹 DATA-ID tallennetaan nappiin
    openCard.dataset.entryId = entry.entry_id;

    // lisätään nappulalle kuuntelija
    openCard.addEventListener('click', () => {
      dialog.showModal();

      // 🔹 TAPA 1: luetaan id data-attribuutista
      const idFromDataset = openCard.dataset.entryId;

      dialog.querySelector('.diary_id').innerHTML = `
    <div>ID data attribuutista: <span>${idFromDataset}</span></div>

    <hr>

    <form id="quickEditForm">
      <!-- 🔹 TAPA 2: hidden input -->
      <input type="hidden" name="entry_id" value="${idFromDataset}" />

      <label>
        Uusi mood:
        <input type="text" name="mood" value="${entry.mood}" />
      </label>

      <button type="submit">Tallenna (demo)</button>
    </form>
  `;

      //////////////////////////////////////////////////////
      // 🔹 Submit-demo hidden inputille
      //////////////////////////////////////////////////////
      const quickForm = dialog.querySelector('#quickEditForm');

      quickForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(quickForm);

        const id = formData.get('entry_id'); // hidden input
        const mood = formData.get('mood');

        alert(`Submit!\nID: ${id}\nMood: ${mood}`);

        console.log('FormData sisältö:');
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }

        dialog.close();
      });
    });

    card.appendChild(cardDiary);
    card.appendChild(openCard);
    diaryContainer.appendChild(card);
  });
};

export { getEntries };
