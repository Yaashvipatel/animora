function openPetDetails(name, type, age, nature, description, emoji) {
  const petData = {
    name: name,
    type: type,
    age: age,
    nature: nature,
    description: description,
    emoji: emoji
  };

  localStorage.setItem("selectedPet", JSON.stringify(petData));
  window.location.href = "pet-details.html";
}
