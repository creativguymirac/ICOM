const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('.main-nav a');

navLinks.forEach(link => {
	link.addEventListener('click', () => {
		if (navToggle.checked) {
			navToggle.checked = false;}
	});
});

const phrases = [
	"de mise en page automatisée.",
	"de support digital.",
	"de support d’impression."
];

let i = 0;        
let j = 0;        
let current = "";
let isDeleting = false;
const speed = 60;   
const eraseSpeed = 35;
const delayBetweenPhrases = 2000;   

function typeEffect() {
	const element = document.getElementById("typewriter");
	const currentPhrase = phrases[i];

	if (!isDeleting) {
        element.textContent = currentPhrase.slice(0, j + 1);
        j++;

        if (j === currentPhrase.length) {
            setTimeout(() => {
                isDeleting = true;
                typeEffect();
            }, 
            delayBetweenPhrases);
            return;
        }
  	} else {
    	element.textContent = currentPhrase.slice(0, j - 1);
		j--;

		if (j === 0) {
    		isDeleting = false;
      		i = (i + 1) % phrases.length;}
		}

  	setTimeout(typeEffect, isDeleting ? eraseSpeed : speed);
}

typeEffect();

// ============================================
// GESTION DU FORMULAIRE DE CONTACT
// ============================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    try {
      // Récupérer les données du formulaire
      const formData = {
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        email: document.getElementById('email').value.trim(),
        telephone: document.getElementById('telephone').value.trim(),
        message: document.getElementById('message').value.trim()
      };

      // État de chargement
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours...';

      // Envoyer au serveur backend
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Succès
        showNotification('success', data.message);
        contactForm.reset();
      } else {
        // Erreur de validation
        const errorMessage = data.errors 
          ? data.errors.map(e => e.message).join(', ')
          : data.message || 'Une erreur est survenue';
        showNotification('error', errorMessage);
      }
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('error', 'Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      // Réinitialiser le bouton
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}

// Fonction pour afficher une notification
function showNotification(type, message) {
  // Supprimer les notifications précédentes
  const existingNotification = document.querySelector('.form-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Créer la notification
  const notification = document.createElement('div');
  notification.className = `form-notification form-notification-${type}`;
  notification.textContent = message;
  
  // Ajouter après le formulaire
  contactForm.parentElement.insertAdjacentElement('afterend', notification);

  // Supprimer après 5 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}