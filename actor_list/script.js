const url = 'https://moviesdatabase.p.rapidapi.com/actors';
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '27b69ba214msh5567206a6702962p157ac6jsnc1a2ca3732e3',
    'x-rapidapi-host': 'moviesdatabase.p.rapidapi.com',
  },
};

let actors = [];
let displayedActorsCount = 8; // Başlangıçta gösterilecek aktör kartı sayısı
let currentActor = null;

// Başlangıç ekranından aktör listesi ekranına geçişi sağlar
function showActorList() {
  document.getElementById('initial-screen').classList.add('hidden');
  document.getElementById('actor-list-screen').classList.remove('hidden');
  fetchActors();
}

// Aktörleri çek ve listele
async function fetchActors() {
  const container = document.getElementById('actors-container');
  const loadingMessage = document.getElementById('loading-message');

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`API Hatası: ${response.status}`);
    }

    const data = await response.json();
    actors = data.results;
    displayActors(actors.slice(0, displayedActorsCount)); // İlk 8 aktörü göster

    loadingMessage.style.display = 'none';
  } catch (error) {
    console.error('API hatası:', error);
    loadingMessage.textContent = 'Aktörler yüklenirken bir hata oluştu.';
  }
}

// Aktörleri ekranda göster
function displayActors(actorsToDisplay) {
  const container = document.getElementById('actors-container');
  container.innerHTML = ''; // Önceki içeriği temizle

  actorsToDisplay.forEach((actor) => {
    const actorCard = createActorCard(
      actor.primaryName || 'Bilinmeyen Aktör',
      actor.birthYear || 'Açıklama bulunamadı'
    );
    container.appendChild(actorCard);
  });
}

// JSON'daki anahtarları ekranda göster
function displayKeys(keys) {
  const jsonKeysDiv = document.getElementById('jsonKeys');
  jsonKeysDiv.innerHTML = `<strong>JSON Keys:</strong> ${keys.join(', ')}`;
}

// Aktör kartı oluştur
function createActorCard(name, description) {
  const actorCard = document.createElement('div');
  actorCard.className = 'actor-card';
  actorCard.innerHTML = `
    <h3>${name}</h3>
    <p>${description || 'Açıklama bulunamadı'}</p>
    <button onclick="showModal('${name}', '${description || ''}')">Düzenle</button>
    <button onclick="deleteActor(this)">Sil</button>
    <div class="rating">
      <span class="star" data-value="1">&#9733;</span>
      <span class="star" data-value="2">&#9733;</span>
      <span class="star" data-value="3">&#9733;</span>
      <span class="star" data-value="4">&#9733;</span>
      <span class="star" data-value="5">&#9733;</span>
    </div>
    <textarea placeholder="Aktörü Yorumlayın......"></textarea>
    <button type="button" onclick="submitComment(this)">Gönder</button>
    <div class="message">Yorumunuz gönderildi!</div>
  `;
  return actorCard;
}

// Modal'ı aç
function showModal(name = '', description = '') {
  currentActor = name ? actors.find(actor => actor.primaryName === name) : null;
  const modal = document.getElementById('actor-modal');
  document.getElementById('actor-name').value = name;
  document.getElementById('actor-description').value = description;
  modal.classList.remove('hidden');

  // Kaydetme işlemine ekleme/düzenleme modu ekle
  const form = document.getElementById('actor-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const actorName = document.getElementById('actor-name').value.trim();
    const actorDescription = document.getElementById('actor-description').value.trim();

    if (currentActor) {
      // Düzenleme modu
      const existingCard = [...document.querySelectorAll('.actor-card')].find(
        (card) => card.querySelector('h3').textContent === currentActor.primaryName
      );
      if (existingCard) {
        existingCard.querySelector('h3').textContent = actorName;
        existingCard.querySelector('p').textContent = actorDescription || 'Açıklama bulunamadı';
        currentActor.primaryName = actorName;
        currentActor.birthYear = actorDescription;
      }
    } else {
      // Yeni aktör ekleme
      addActor(actorName, actorDescription);
    }

    closeModal();
  };
}

// Modal'ı kapat
function closeModal() {
  const modal = document.getElementById('actor-modal');
  modal.classList.add('hidden');
}

// Yeni aktör ekle
function addActor(name, description) {
  const newActor = {
    primaryName: name,
    birthYear: description,
  };
  actors.push(newActor);

  const container = document.getElementById('actors-container');
  const actorCard = createActorCard(name, description);
  container.appendChild(actorCard);
}

// Aktörü sil
function deleteActor(button) {
  const card = button.parentElement;
  const actorName = card.querySelector('h3').textContent;
  actors = actors.filter(actor => actor.primaryName !== actorName);
  card.remove();
}

// Arama filtresi uygula
function filterItems() {
  const input = document.getElementById('searchInput');
  const filter = input.value.toLowerCase();
  const container = document.getElementById('actors-container');
  const cards = container.getElementsByClassName('actor-card');

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const txtValue = card.textContent || card.innerText;
    if (txtValue.toLowerCase().indexOf(filter) > -1) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  }
}

// Tüm aktörleri göster
function showAllActors() {
  displayActors(actors);
}

// Yıldız derecelendirme işlevselliği
document.addEventListener('click', function (e) {
  if (!e.target.matches('.star')) return;

  const star = e.target;
  const stars = Array.from(star.parentNode.children);
  const index = stars.indexOf(star);

  stars.forEach((s, i) => {
    if (i <= index) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
});

// Yorumu gönderme ve onay mesajı gösterme işlevselliği
function submitComment(button) {
  const commentBox = button.previousElementSibling;
  const confirmationMessage = button.nextElementSibling;

  // Yorum kutusunu temizle
  commentBox.value = '';

  // Onay mesajını göster
  confirmationMessage.style.display = 'block';

  // Bir süre sonra onay mesajını gizle
  setTimeout(() => {
    confirmationMessage.style.display = 'none';
  }, 3000);
}

// Tema değiştirme işlevselliği
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

// Sayfa yüklendiğinde aktörleri getir
fetchActors();
