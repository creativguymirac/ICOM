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