// Prévisualisation de l'image avant téléchargement
document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('image');
  const profileImageInput = document.getElementById('profileImage');
  
  // Pour les posts
  if (imageInput) {
    imageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          // Créer un élément de prévisualisation s'il n'existe pas
          let preview = document.getElementById('image-preview');
          if (!preview) {
            preview = document.createElement('div');
            preview.id = 'image-preview';
            preview.className = 'mt-2';
            imageInput.parentNode.appendChild(preview);
          }
          
          preview.innerHTML = `
            <div class="card mb-2">
              <img src="${e.target.result}" class="card-img-top" alt="Prévisualisation">
              <div class="card-body p-2">
                <button type="button" class="btn btn-sm btn-danger" id="remove-image">Retirer</button>
              </div>
            </div>
          `;
          
          document.getElementById('remove-image').addEventListener('click', function() {
            imageInput.value = '';
            preview.remove();
          });
        }
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Pour l'image de profil
  if (profileImageInput) {
    profileImageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          // Créer un élément de prévisualisation s'il n'existe pas
          let preview = document.getElementById('profile-image-preview');
          if (!preview) {
            preview = document.createElement('div');
            preview.id = 'profile-image-preview';
            preview.className = 'mt-2';
            profileImageInput.parentNode.appendChild(preview);
          }
          
          preview.innerHTML = `
            <div class="card mb-2">
              <img src="${e.target.result}" class="card-img-top" alt="Prévisualisation">
              <div class="card-body p-2">
                <button type="button" class="btn btn-sm btn-danger" id="remove-profile-image">Retirer</button>
              </div>
            </div>
          `;
          
          document.getElementById('remove-profile-image').addEventListener('click', function() {
            profileImageInput.value = '';
            preview.remove();
          });
        }
        reader.readAsDataURL(file);
      }
    });
  }
});